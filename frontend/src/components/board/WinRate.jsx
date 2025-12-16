import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
} from "chart.js";
import { getRelativePosition } from "chart.js/helpers";
import { useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";

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
    const chartRef = useRef(null);

    // Memoize options to avoid recreating on every render
    const options = useMemo(
        () => ({
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

                const { x: mouseX, y: mouseY } = getRelativePosition(
                    event,
                    chartArea
                );
                const xValue = xScale.getValueForPixel(mouseX); // x-axis is 0-based, so we need to add 1

                if (
                    mouseX < chartArea.left ||
                    mouseX > chartArea.right ||
                    mouseY < chartArea.top ||
                    mouseY > chartArea.bottom
                ) {
                    setHoverX(null);
                } else {
                    setHoverX(
                        xValue * (chartWidth / xScale.max) + chartArea.left
                    );
                }
            },
            onClick: (event) => {
                const chart = chartRef.current;
                if (!chart) {
                    return;
                }

                const { x: mouseX } = getRelativePosition(
                    event,
                    chart.chartArea
                );
                const xScale = chart.scales.x;
                const xValue = Math.min(
                    xScale.getValueForPixel(mouseX) + 1,
                    maxMove - 1
                );
                setMove(xValue);
            },
        }),
        [hoverX, maxMove, setMove]
    );

    const plugins = useMemo(
        () => [
            {
                id: "customCanvasBackgroundColor",
                beforeDraw: (chart, _, options) => {
                    const { ctx: canvasContext } = chart;
                    canvasContext.save();
                    canvasContext.globalCompositeOperation = "destination-over";
                    canvasContext.fillStyle = options.color || "#99ffff";
                    canvasContext.fillRect(0, 0, chart.width, chart.height);
                    canvasContext.restore();
                },
            },
            {
                id: "verticalLine",
                afterDraw: (chart) => {
                    const hoverXValue =
                        chart.options.plugins.verticalLine?.hoverX;

                    if (!hoverXValue) {
                        return;
                    }

                    const { ctx: canvasContext } = chart;
                    const { chartArea } = chart;

                    canvasContext.save();
                    canvasContext.beginPath();
                    canvasContext.moveTo(hoverXValue, chartArea.top);
                    canvasContext.lineTo(hoverXValue, chartArea.bottom);
                    canvasContext.lineWidth = 2;
                    canvasContext.strokeStyle = "rgba(255, 0, 0, 0.8)";
                    canvasContext.setLineDash([5, 5]);
                    canvasContext.stroke();
                    canvasContext.restore();
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
        ],
        []
    );

    // Consolidate all data processing into a single effect
    const lineData = useMemo(() => {
        if (!data || data.length === 0) {
            return {
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
            };
        }

        const blackWinRate = data;
        const whiteWinRate = data.map((rate) => 100 - rate);

        return {
            labels: Array.from({ length: maxMove }, (_, i) => i + 1),
            datasets: [
                {
                    label: "Black",
                    data: blackWinRate,
                    fill: false,
                    borderColor: "black",
                    tension: 0.2,
                    pointRadius: 0,
                    segment: {
                        borderColor: (ctx) => {
                            const moveIndex = ctx.p0.parsed.x + 1;
                            if (moveIndex < currentMove) {
                                return "black";
                            }
                            return "rgba(0, 0, 0, 0.2)";
                        },
                    },
                },
                {
                    label: "White",
                    data: whiteWinRate,
                    fill: false,
                    borderColor: "white",
                    tension: 0.2,
                    pointRadius: 0,
                    segment: {
                        borderColor: (ctx) => {
                            const moveIndex = ctx.p0.parsed.x + 1;
                            if (moveIndex < currentMove) {
                                return "white";
                            }
                            return "rgba(255, 255, 255, 0.2)";
                        },
                    },
                },
            ],
        };
    }, [data, maxMove, currentMove]);

    return (
        <>
            {lineData.datasets[0].data ? (
                <Box
                    sx={{
                        position: "relative",
                        my: 3,
                        height: 300,
                        width: { xs: "100%", sm: 600 },
                        cursor: "pointer",
                    }}
                >
                    <Line
                        ref={chartRef}
                        data={lineData}
                        options={options}
                        plugins={plugins}
                    />
                </Box>
            ) : (
                <Box
                    sx={{
                        my: 3,
                        width: "100%",
                        px: 2,
                        py: 3,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="body1">No win rate data</Typography>
                </Box>
            )}
        </>
    );
}

export default WinRate;
