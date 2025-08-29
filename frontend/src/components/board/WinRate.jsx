import { useEffect, useState } from "react";
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
import styles from "../../styles/components/board/WinRate.module.css";

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
    options = {
        responsive: true,
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
        },
        scales: {
            y: {
                suggestedMin: 0,
                suggestedMax: 100,
            },
        },
    },
}) {
    const [lineData, setLineData] = useState({
        labels: [],
        datasets: [
            {
                label: "Black",
                data: [],
                fill: false,
                borderColor: "black",
                tension: 0.1,
            },
            {
                label: "White",
                data: [],
                fill: false,
                borderColor: "white",
                tension: 0.1,
            },
        ],
    });
    const [blackWinRate, setBlackWinRate] = useState([]);
    const [whiteWinRate, setWhiteWinRate] = useState([]);
    const plugin = {
        id: "customCanvasBackgroundColor",
        beforeDraw: (chart, args, options) => {
            const { ctx } = chart;
            ctx.save();
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = options.color || "#99ffff";
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        },
    };

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
            labels: Array(maxMove)
                .fill(1)
                .map((value, index) => value + index),
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
    }, [blackWinRate, whiteWinRate, maxMove]);

    return (
        <>
            {lineData.datasets[0].data ? (
                <div className={styles.graphContainer}>
                    <Line
                        data={lineData}
                        options={options}
                        plugins={[plugin]}
                    />
                </div>
            ) : (
                <div className={styles.container}>
                    <p>No win rate data</p>
                </div>
            )}
        </>
    );
}

export default WinRate;
