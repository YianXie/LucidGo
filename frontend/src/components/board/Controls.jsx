import { toast } from "react-toastify";
import { useRef, useState } from "react";
import styles from "../../styles/components/board/Controls.module.css";

/**
 * A control panel for the game board
 * @param {number} move - the current move, should be a state
 * @param {callback} setMove - the function that set the move state
 * @param {number} max - the maximum possible move
 * @param {object} tools - an object that contains all the callbacks for different function buttons
 * @returns
 */
function Controls({ move, setMove, max, tools }) {
    const skipBackAmount = 5;
    const resetRef = useRef(null);
    const [showRecommendations, setShowRecommendations] = useState(true);

    return (
        <div className={styles.container}>
            <svg
                ref={resetRef}
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className={"bi bi-arrow-clockwise " + styles.reset}
                viewBox="0 0 16 16"
                onClick={() => {
                    resetRef.current.classList.add(styles.clicked);
                    tools.handleReset();

                    setTimeout(() => {
                        resetRef.current.classList.remove(styles.clicked);
                    }, 300);
                }}
            >
                <title>Reset your board and re-upload file</title>
                <path
                    fillRule="evenodd"
                    d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
                />
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
            </svg>
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
                    onClick={() => {
                        if (move === 1) {
                            toast.error("Already at the start!");
                        } else {
                            setMove(1);
                        }
                    }}
                >
                    <title>Jump to the start</title>
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
                    onClick={() => {
                        if (move === 1) {
                            toast.error("Already at the end!");
                        } else {
                            setMove(Math.max(move - skipBackAmount, 1));
                        }
                    }}
                >
                    <title>{skipBackAmount} moves backward</title>
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
                    <title>1 move backward</title>
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
                    <title>1 move forward</title>
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
                    title={`${skipBackAmount} moves forward`}
                    onClick={() => {
                        if (move === max - 1) {
                            toast.error("Already at the end!");
                        } else {
                            setMove(Math.min(move + skipBackAmount, max - 1));
                        }
                    }}
                >
                    <title>{skipBackAmount} moves forward</title>
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
                    onClick={() => {
                        if (move === max - 1) {
                            toast.error("Already at the end!");
                        } else {
                            setMove(max - 1);
                        }
                    }}
                >
                    <title>Jump to the end</title>
                    <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2m4.79-6.907A.5.5 0 0 0 4 5.5v5a.5.5 0 0 0 .79.407L7.5 8.972V10.5a.5.5 0 0 0 .79.407L11 8.972V10.5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-1 0v1.528L8.29 5.093a.5.5 0 0 0-.79.407v1.528z" />
                </svg>
            </div>

            {showRecommendations ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className={"bi bi-eye-fill " + styles.analyze}
                    viewBox="0 0 16 16"
                    onClick={() => {
                        setShowRecommendations(!showRecommendations);
                        tools.handleAnalyze();
                    }}
                >
                    <title>Toggle recommended moves</title>
                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className={"bi bi-eye-slash-fill " + styles.analyze}
                    viewBox="0 0 16 16"
                    onClick={() => {
                        setShowRecommendations(!showRecommendations);
                        tools.handleAnalyze();
                    }}
                >
                    <title>Toggle recommended moves</title>
                    <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                    <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                </svg>
            )}
        </div>
    );
}

export default Controls;
