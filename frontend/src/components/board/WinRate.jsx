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
        },
    },
}) {
    return (
        <>
            {data ? (
                <Line data={data} options={options} />
            ) : (
                <div className={styles.container}>
                    <p>No win rate data</p>
                </div>
            )}
        </>
    );
}

export default WinRate;
