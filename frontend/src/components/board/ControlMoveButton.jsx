/**
 * ControlMoveButton component
 * @param {string} className The class name of the icon
 * @param {string} label The aria-label of the icon
 * @param {amount} number The amount of move to update
 * @param {number} move The current move number
 * @param {function} setMove The function to update the move
 * @param {number} maxMove The maximum move
 * @returns {React.ReactNode} The button component
 */
function ControlMoveButton({
    className,
    label,
    amount,
    move,
    setMove,
    maxMove,
}) {
    const disabled = amount < 1 ? move <= 1 : move >= maxMove - 1;

    return (
        <div
            className={`flex items-center justify-center ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:opacity-80 active:translate-y-1"}`}
            aria-label={label}
            onClick={() => {
                setMove((prev) => {
                    if (prev + amount > maxMove - 1 || prev + amount < 1) {
                        return amount < 1 ? 1 : maxMove - 1;
                    }
                    return prev + amount;
                });
            }}
        >
            <i
                className={`${className} relative text-3xl ${disabled ? "text-gray-500" : "text-text-1"}`}
            ></i>
        </div>
    );
}

export default ControlMoveButton;
