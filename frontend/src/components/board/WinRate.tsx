import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
    type ActiveElement,
    CategoryScale,
    type Chart,
    type ChartData,
    type ChartEvent,
    Chart as ChartJS,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    type ScriptableLineSegmentContext,
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

function WinRate({
    data,
    maxMove,
    setMove,
    currentMove,
}: {
    data: number[] | null | undefined;
    maxMove: number;
    setMove: (n: number) => void;
    currentMove: number;
}) {
    const [hoverX, setHoverX] = useState<number | null>(null);
    const chartRef = useRef<Chart<"line"> | null>(null);

    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "top" as const,
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
            onHover: (
                event: ChartEvent,
                _active: ActiveElement[],
                chart: Chart
            ) => {
                const chartArea = chart.chartArea;
                const chartWidth = chartArea.right - chartArea.left;
                const xScale = chart.scales.x;

                const { x: mouseX, y: mouseY } = getRelativePosition(
                    event as unknown as MouseEvent,
                    chart
                );

                if (
                    mouseX < chartArea.left ||
                    mouseX > chartArea.right ||
                    mouseY < chartArea.top ||
                    mouseY > chartArea.bottom
                ) {
                    setHoverX(null);
                } else {
                    const xValue = xScale.getValueForPixel(mouseX);
                    setHoverX(
                        (xValue ?? 0) * (chartWidth / (xScale.max ?? 1)) +
                            chartArea.left
                    );
                }
            },
            onClick: (
                event: ChartEvent,
                _elements: ActiveElement[],
                chart: Chart
            ) => {
                const { x: mouseX } = getRelativePosition(
                    event as unknown as MouseEvent,
                    chart
                );
                const xScale = chart.scales.x;
                const xValue = Math.min(
                    (xScale.getValueForPixel(mouseX) ?? 0) + 1,
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
                beforeDraw: (
                    chart: Chart,
                    _args: unknown,
                    options: { color?: string }
                ) => {
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
                afterDraw: (chart: Chart) => {
                    const hoverXValue = (
                        chart.options.plugins as {
                            verticalLine?: { hoverX?: number | null };
                        }
                    ).verticalLine?.hoverX;

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
                beforeEvent: (
                    chart: Chart,
                    args: { event: { type: string } }
                ) => {
                    const event = args.event;
                    if (event.type === "mouseout") {
                        setHoverX(null);
                    }
                },
            },
        ],
        []
    );

    const lineData = useMemo((): ChartData<"line"> => {
        if (!data || data.length === 0) {
            return {
                labels: [] as number[],
                datasets: [
                    {
                        label: "Black",
                        data: [] as number[],
                        fill: false,
                        borderColor: "black",
                        tension: 0.2,
                        pointRadius: 0,
                    },
                    {
                        label: "White",
                        data: [] as number[],
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
                        borderColor: (ctx: ScriptableLineSegmentContext) => {
                            const moveIndex = (ctx.p0.parsed.x ?? 0) + 1;
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
                        borderColor: (ctx: ScriptableLineSegmentContext) => {
                            const moveIndex = (ctx.p0.parsed.x ?? 0) + 1;
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
            {data && data.length > 0 ? (
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
