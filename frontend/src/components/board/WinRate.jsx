import { useEffect, useState, useRef } from "react";
import {
    Chart as ChartJS,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getRelativePosition } from "chart.js/helpers";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function WinRate({ data, maxMove, setMove, currentMove }) {
    const [hoverX, setHoverX] = useState(null);
    const [blackWinRate, setBlackWinRate] = useState([]);
    const [whiteWinRate, setWhiteWinRate] = useState([]);
    const chartRef = useRef(null);
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Win Rate",
            },
            customCanvasBackgroundColor: {
                color: "rgb(160, 160, 160)",
            },
            verticalLine: {
                hoverX: hoverX,
            },
        },
        scales: {
            y: {
                suggestedMin: 0,
                suggestedMax: 100,
                title: {
                    display: true,
                    text: "Win Rate (%)",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Move",
                },
            },
        },
        onHover: (event) => {
            const chart = chartRef.current;
            if (!chart) {
                return;
            }

            const chartArea = chart.chartArea;
            const chartWidth = chartArea.right - chartArea.left;
            const xScale = chart.scales.x;

            const { x, y } = getRelativePosition(event, chartArea);
            const xValue = xScale.getValueForPixel(x); // x-axis is 0-based, so we need to add 1

            if (
                x < chartArea.left ||
                x > chartArea.right ||
                y < chartArea.top ||
                y > chartArea.bottom
            ) {
                setHoverX(null);
            } else {
                setHoverX(xValue * (chartWidth / xScale.max) + chartArea.left);
            }
        },
        onClick: (event) => {
            const chart = chartRef.current;
            if (!chart) {
                return;
            }

            const { x } = getRelativePosition(event, chart.chartArea);
            const xScale = chart.scales.x;
            const xValue = Math.min(
                xScale.getValueForPixel(x) + 1,
                maxMove - 1
            );
            setMove(xValue);
        },
    };
    const [lineData, setLineData] = useState({
        labels: [],
        datasets: [
            {
                label: "Black",
                data: [],
                fill: false,
                borderColor: "black",
                tension: 0.2,
                pointRadius: 0,
            },
            {
                label: "White",
                data: [],
                fill: false,
                borderColor: "white",
                tension: 0.2,
                pointRadius: 0,
            },
        ],
    });
    const plugins = [
        {
            id: "customCanvasBackgroundColor",
            beforeDraw: (chart, _, options) => {
                const { ctx } = chart;
                ctx.save();
                ctx.globalCompositeOperation = "destination-over";
                ctx.fillStyle = options.color || "#99ffff";
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            },
        },
        {
            id: "verticalLine",
            afterDraw: (chart) => {
                const hoverXValue = chart.options.plugins.verticalLine?.hoverX;

                if (!hoverXValue) {
                    return;
                }

                const { ctx } = chart;
                const { chartArea } = chart;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(hoverXValue, chartArea.top);
                ctx.lineTo(hoverXValue, chartArea.bottom);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.restore();
            },
        },
        {
            id: "eventListener",
            beforeEvent: (chart, args) => {
                const event = args.event;
                if (event.type === "mouseout") {
                    setHoverX(null);
                }
            },
        },
    ];

    useEffect(() => {
        if (!data) {
            return;
        }

        const black = [],
            white = [];
        for (let i = 0; i < data.length; i++) {
            black.push(data[i]);
            white.push(100 - data[i]);
        }
        setBlackWinRate(black);
        setWhiteWinRate(white);
    }, [data]);

    useEffect(() => {
        setLineData({
            labels: Array.from({ length: maxMove }, (_, i) => i + 1),
            datasets: [
                {
                    ...lineData.datasets[0],
                    data: blackWinRate,
                },
                {
                    ...lineData.datasets[1],
                    data: whiteWinRate,
                },
            ],
        });
    }, [blackWinRate, whiteWinRate, maxMove, currentMove]);

    useEffect(() => {
        setLineData({
            ...lineData,
            datasets: [
                {
                    ...lineData.datasets[0],
                    segment: {
                        borderColor: (ctx) => {
                            const x = ctx.p0.parsed.x + 1;
                            if (x < currentMove) {
                                return "black";
                            }
                            return "rgba(0, 0, 0, 0.2)";
                        },
                    },
                },
                {
                    ...lineData.datasets[1],
                    segment: {
                        borderColor: (ctx) => {
                            const x = ctx.p0.parsed.x + 1;
                            if (x < currentMove) {
                                return "white";
                            }
                            return "rgba(255, 255, 255, 0.2)";
                        },
                    },
                },
            ],
        });
    }, [currentMove]);

    return (
        <>
            {lineData.datasets[0].data ? (
                <div className="relative my-5 h-100 w-200 cursor-pointer">
                    <Line
                        ref={chartRef}
                        data={lineData}
                        options={options}
                        plugins={plugins}
                    />
                </div>
            ) : (
                <div className="my-5 w-full px-2.5 py-5">
                    <p className="text-text-1">No win rate data</p>
                </div>
            )}
        </>
    );
}

export default WinRate;
