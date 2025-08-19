import styles from "../../styles/components/board/Controls.module.css";

function Controls({ setMove, max }) {
    return (
        <div>
            <button
                onClick={() => {
                    setMove((prev) => {
                        if (prev > 0) {
                            return prev - 1;
                        }
                        return prev;
                    });
                }}
            >
                Previous
            </button>
            <button
                onClick={() => {
                    setMove((prev) => {
                        if (prev < max) {
                            return prev + 1;
                        }
                        return prev;
                    });
                }}
            >
                Next
            </button>
        </div>
    );
}

export default Controls;
