import { toast } from "react-toastify";
import styles from "../../styles/components/board/Controls.module.css";

function Controls({ move, setMove, max }) {
    const skipBackAmount = 5;

    return (
        <div className={styles.container}>
            <div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className={
                        "bi bi-skip-backward-btn-fill " +
                        (move <= 1 ? styles.disabled : "")
                    }
                    viewBox="0 0 16 16"
                    title="Back to the start"
                    onClick={() => {
                        if (move === 1) {
                            toast.error("Already at the start!");
                        } else {
                            setMove(1);
                        }
                    }}
                >
                    <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2m11.21-6.907L8.5 7.028V5.5a.5.5 0 0 0-.79-.407L5 7.028V5.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0V8.972l2.71 1.935a.5.5 0 0 0 .79-.407V8.972l2.71 1.935A.5.5 0 0 0 12 10.5v-5a.5.5 0 0 0-.79-.407" />
                </svg>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="currentColor"
                    className={
                        "bi bi-skip-start-btn-fill " +
                        (move <= 1 ? styles.disabled : "")
                    }
                    viewBox="0 0 16 16"
                    title="5 moves back"
                    onClick={() => {
                        if (move === 1) {
                            toast.error("Already at the end!");
                        } else {
                            setMove(Math.max(move - skipBackAmount, 1));
                        }
                    }}
                >
                    <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2m9.71-6.907L7 7.028V5.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0V8.972l2.71 1.935a.5.5 0 0 0 .79-.407v-5a.5.5 0 0 0-.79-.407" />
                </svg>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="currentColor"
                    className={
                        "bi bi-arrow-left-square-fill " +
                        (move <= 1 ? styles.disabled : "")
                    }
                    viewBox="0 0 16 16"
                    title="1 move back"
                    onClick={() => {
                        if (move <= 1) {
                            toast.error("Already at the start!");
                        }
                        setMove((prev) => {
                            if (prev > 1) {
                                return prev - 1;
                            }
                            return prev;
                        });
                    }}
                >
                    <path d="M16 14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2zm-4.5-6.5H5.707l2.147-2.146a.5.5 0 1 0-.708-.708l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708-.708L5.707 8.5H11.5a.5.5 0 0 0 0-1" />
                </svg>
            </div>
            <p className={styles.moveNumber}>{move}</p>
            <div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="currentColor"
                    className={
                        "bi bi-arrow-right-square-fill " +
                        (move >= max - 1 ? styles.disabled : "")
                    }
                    viewBox="0 0 16 16"
                    title="1 move forward"
                    onClick={() => {
                        if (move >= max - 1) {
                            toast.error("Already at the end!");
                        }
                        setMove((prev) => {
                            if (prev < max - 1) {
                                return prev + 1;
                            }
                            return prev;
                        });
                    }}
                >
                    <path d="M0 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2zm4.5-6.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5a.5.5 0 0 1 0-1" />
                </svg>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="currentColor"
                    className={
                        "bi bi-skip-end-btn-fill " +
                        (move >= max - 1 ? styles.disabled : "")
                    }
                    viewBox="0 0 16 16"
                    title="5 moves forward"
                    onClick={() => {
                        if (move === max - 1) {
                            toast.error("Already at the end!");
                        } else {
                            setMove(Math.min(move + skipBackAmount, max - 1));
                        }
                    }}
                >
                    <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2m6.79-6.907A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407L9.5 8.972V10.5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-1 0v1.528z" />
                </svg>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className={
                        "bi bi-skip-forward-btn-fill " +
                        (move >= max - 1 ? styles.disabled : "")
                    }
                    viewBox="0 0 16 16"
                    title="skip to the end"
                    onClick={() => {
                        if (move === max - 1) {
                            toast.error("Already at the end!");
                        } else {
                            setMove(max - 1);
                        }
                    }}
                >
                    <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2m4.79-6.907A.5.5 0 0 0 4 5.5v5a.5.5 0 0 0 .79.407L7.5 8.972V10.5a.5.5 0 0 0 .79.407L11 8.972V10.5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-1 0v1.528L8.29 5.093a.5.5 0 0 0-.79.407v1.528z" />
                </svg>
            </div>
        </div>
    );
}

export default Controls;
