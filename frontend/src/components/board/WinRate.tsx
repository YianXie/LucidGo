import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
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
    setMove,
    currentMove,
}: {
    data: { black: number; white: number }[] | null | undefined;
    setMove: (n: number) => void;
    currentMove: number;
}) {
    const theme = useTheme();
    const [hoverX, setHoverX] = useState<number | null>(null);
    const chartRef = useRef<Chart<"line"> | null>(null);

    const dataLength = data?.length ?? 0;

    /** Theme-aware line colors: black/gray on light UI, light/mid gray on dark UI */
    const linePalette = useMemo(() => {
        const isDark = theme.palette.mode === "dark";
        const black = isDark
            ? theme.palette.grey[300]!
            : theme.palette.grey[900]!;
        const white = isDark
            ? theme.palette.grey[500]!
            : theme.palette.grey[700]!;
        return {
            black,
            blackMuted: alpha(black, 0.22),
            white,
            whiteMuted: alpha(white, 0.22),
        };
    }, [theme]);

    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            animation: false as const,
            plugins: {
                legend: {
                    position: "top" as const,
                },
                title: {
                    display: true,
                    text: "Win Rate",
                },
                verticalLine: {
                    hoverX: hoverX,
                    currentMove: currentMove,
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
                    const xValue = xScale.getValueForPixel(mouseX) ?? 0;
                    const snappedIndex = Math.max(
                        0,
                        Math.min(dataLength - 1, Math.round(xValue))
                    );
                    setHoverX(xScale.getPixelForValue(snappedIndex));
                }
            },
            onClick: (
                event: ChartEvent,
                _elements: ActiveElement[],
                chart: Chart
            ) => {
                const chartArea = chart.chartArea;
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
                    return;
                }
                const xValue = xScale.getValueForPixel(mouseX) ?? 0;
                const snappedIndex = Math.max(
                    0,
                    Math.min(dataLength - 1, Math.round(xValue))
                );
                setMove(snappedIndex);
            },
        }),
        [hoverX, currentMove, dataLength, setMove]
    );

    const plugins = useMemo(
        () => [
            {
                id: "verticalLine",
                afterDraw: (chart: Chart) => {
                    const pluginOpts = (
                        chart.options.plugins as {
                            verticalLine?: {
                                hoverX?: number | null;
                                currentMove?: number;
                            };
                        }
                    ).verticalLine;

                    const { ctx: canvasContext, chartArea, scales } = chart;
                    const xScale = scales.x;

                    // Draw current-move indicator (teal dashed line)
                    const currentMoveValue = pluginOpts?.currentMove;
                    if (
                        currentMoveValue != null &&
                        dataLength > 0 &&
                        currentMoveValue >= 0 &&
                        currentMoveValue < dataLength
                    ) {
                        const currentX =
                            xScale.getPixelForValue(currentMoveValue);
                        canvasContext.save();
                        canvasContext.beginPath();
                        canvasContext.moveTo(currentX, chartArea.top);
                        canvasContext.lineTo(currentX, chartArea.bottom);
                        canvasContext.lineWidth = 2;
                        canvasContext.strokeStyle = "rgba(0, 150, 136, 0.8)";
                        canvasContext.setLineDash([4, 4]);
                        canvasContext.stroke();
                        canvasContext.restore();
                    }

                    // Draw hover line (red solid line)
                    const hoverXValue = pluginOpts?.hoverX;
                    if (hoverXValue != null) {
                        canvasContext.save();
                        canvasContext.beginPath();
                        canvasContext.moveTo(hoverXValue, chartArea.top);
                        canvasContext.lineTo(hoverXValue, chartArea.bottom);
                        canvasContext.lineWidth = 2;
                        canvasContext.strokeStyle = "rgba(255, 0, 0, 0.8)";
                        canvasContext.setLineDash([]);
                        canvasContext.stroke();
                        canvasContext.restore();
                    }
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const lineData = useMemo((): ChartData<"line"> => {
        const { black, blackMuted, white, whiteMuted } = linePalette;

        if (!data || data.length === 0) {
            return {
                labels: [] as number[],
                datasets: [
                    {
                        label: "Black",
                        data: [] as number[],
                        fill: false,
                        borderColor: black,
                        borderWidth: 2,
                        tension: 0.2,
                        pointRadius: 0,
                    },
                    {
                        label: "White",
                        data: [] as number[],
                        fill: false,
                        borderColor: white,
                        borderWidth: 2,
                        tension: 0.2,
                        pointRadius: 0,
                    },
                ],
            };
        }

        const blackWinRate = data.map((rate) => rate.black);
        const whiteWinRate = data.map((rate) => rate.white);

        return {
            labels: Array.from({ length: data.length }, (_, i) => i),
            datasets: [
                {
                    label: "Black",
                    data: blackWinRate,
                    fill: false,
                    borderColor: black,
                    borderWidth: 2,
                    tension: 0.2,
                    pointRadius: 0,
                    segment: {
                        borderColor: (ctx: ScriptableLineSegmentContext) => {
                            const moveIndex = ctx.p0.parsed.x ?? 0;
                            return moveIndex < currentMove ? black : blackMuted;
                        },
                    },
                },
                {
                    label: "White",
                    data: whiteWinRate,
                    fill: false,
                    borderColor: white,
                    borderWidth: 2,
                    tension: 0.2,
                    pointRadius: 0,
                    segment: {
                        borderColor: (ctx: ScriptableLineSegmentContext) => {
                            const moveIndex = ctx.p0.parsed.x ?? 0;
                            return moveIndex < currentMove ? white : whiteMuted;
                        },
                    },
                },
            ],
        };
    }, [data, currentMove, linePalette]);

    return (
        <>
            {data && data.length > 0 ? (
                <Box
                    sx={{
                        position: "relative",
                        my: 1,
                        height: 220,
                        width: "100%",
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
                        my: 1,
                        width: "100%",
                        px: 2,
                        py: 2,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Run AI analysis to see win rate graph
                    </Typography>
                </Box>
            )}
        </>
    );
}

export default WinRate;
