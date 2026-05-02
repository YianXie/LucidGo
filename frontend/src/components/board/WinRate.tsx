import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
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

const WinRate = ({
    data,
    setMove,
    currentMove,
}: {
    data: { black: number; white: number }[] | null | undefined;
    setMove: (n: number) => void;
    currentMove: number;
}) => {
    const [hoverX, setHoverX] = useState<number | null>(null);
    const chartRef = useRef<Chart<"line"> | null>(null);
    const leadersRef = useRef<("black" | "white")[]>([]);

    const dataLength = data?.length ?? 0;

    const linePalette = useMemo(() => {
        const black = "#000000";
        const white = "#ffffff";
        return { black, white };
    }, []);

    // Derive which player leads at each move; sync to ref for use in stable plugin closures
    const leaders = useMemo(() => {
        const result = data
            ? data.map((rate) =>
                  rate.black >= rate.white
                      ? ("black" as const)
                      : ("white" as const)
              )
            : [];
        leadersRef.current = result;
        return result;
    }, [data]);

    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            animation: false as const,
            plugins: {
                legend: { display: false },
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
                    min: 50,
                    max: 100,
                    title: {
                        display: true,
                        text: "Win Rate (%)",
                    },
                    grid: {
                        color: (ctx: { tick: { value: number } }) =>
                            ctx.tick.value === 50
                                ? "rgba(0,0,0,0.45)"
                                : "rgba(0,0,0,0.08)",
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
                id: "chartBackground",
                beforeDraw: (chart: Chart) => {
                    const { ctx, width, height } = chart;
                    ctx.save();
                    ctx.fillStyle = "#A9A9A9";
                    ctx.fillRect(0, 0, width, height);
                    ctx.restore();
                },
            },
            {
                id: "leadingFill",
                beforeDatasetsDraw: (chart: Chart) => {
                    const { ctx, scales } = chart;
                    const yScale = scales.y;
                    const meta = chart.getDatasetMeta(0);
                    const points = meta.data;
                    const leaders = leadersRef.current;

                    if (!points || points.length < 2) return;

                    const y50 = yScale.getPixelForValue(50);

                    for (let i = 0; i < points.length - 1; i++) {
                        const p0 = points[i]!;
                        const p1 = points[i + 1]!;
                        const leader = leaders[i] ?? "black";

                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(p0.x, y50);
                        ctx.lineTo(p0.x, p0.y);
                        ctx.lineTo(p1.x, p1.y);
                        ctx.lineTo(p1.x, y50);
                        ctx.closePath();
                        ctx.fillStyle =
                            leader === "black"
                                ? "rgba(20, 20, 20, 0.8)"
                                : "rgba(220, 220, 220, 0.8)";
                        ctx.fill();
                        ctx.restore();
                    }
                },
            },
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
        const { black, white } = linePalette;

        if (!data || data.length === 0) {
            return {
                labels: [] as number[],
                datasets: [
                    {
                        label: "Win Rate",
                        data: [] as number[],
                        fill: false,
                        borderColor: black,
                        borderWidth: 2,
                        tension: 0.2,
                        pointRadius: 0,
                    },
                ],
            };
        }

        const leadingRates = data.map((rate) =>
            Math.max(rate.black, rate.white)
        );

        return {
            labels: Array.from({ length: data.length }, (_, i) => i),
            datasets: [
                {
                    label: "Win Rate",
                    data: leadingRates,
                    fill: false,
                    borderWidth: 2,
                    tension: 0.2,
                    pointRadius: 0,
                    segment: {
                        borderColor: (ctx: ScriptableLineSegmentContext) => {
                            const idx = ctx.p0DataIndex;
                            const baseColor =
                                leaders[idx] === "black" ? black : white;
                            return idx < currentMove
                                ? baseColor
                                : alpha(baseColor, 0.22);
                        },
                    },
                },
            ],
        };
    }, [data, currentMove, leaders, linePalette]);

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
};

export default WinRate;
