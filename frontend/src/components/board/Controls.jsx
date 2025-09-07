import FlexRow from "../global/FlexRow";
import ControlMoveButton from "./ControlMoveButton";
import ControlUtilButton from "./ControlUtilButton";

/**
 * A control panel for the game board
 * @param {number} move - the current move, should be a state
 * @param {callback} setMove - the function that set the move state
 * @param {number} maxMove - the maximum possible move
 * @param {object} tools - an object that contains all the callbacks for different function buttons
 * @returns
 */
function Controls({
    move,
    setMove,
    maxMove,
    setShowRecommendedMoves,
    showRecommendedMoves,
}) {
    const fastForwardAmount = 5;

    return (
        <div className="bg-bg-4 shadow-bg-2 flex w-full items-center justify-center gap-5 rounded-b-xl p-2.5 shadow-md">
            <ControlUtilButton
                className={"bi bi-arrow-clockwise"}
                onClick={() => {
                    location.reload();
                }}
                label={"Refresh your board"}
            />
            <FlexRow gap={2} className={"ml-auto gap-3"}>
                <ControlMoveButton
                    className={"bi bi-skip-backward-btn-fill"}
                    label={"Move to the beginning"}
                    amount={-maxMove}
                    move={move}
                    setMove={setMove}
                    maxMove={maxMove}
                />
                <ControlMoveButton
                    className={"bi bi-rewind-btn-fill"}
                    label={`Rewind ${fastForwardAmount} moves`}
                    amount={-fastForwardAmount}
                    move={move}
                    setMove={setMove}
                    maxMove={maxMove}
                />
                <ControlMoveButton
                    className={"bi bi-arrow-left-square-fill"}
                    label={"Move backward 1 move"}
                    amount={-1}
                    move={move}
                    setMove={setMove}
                    maxMove={maxMove}
                />
            </FlexRow>
            <p className="text-white">{move}</p>
            <FlexRow gap={2} className={"mr-auto gap-3"}>
                <ControlMoveButton
                    className={"bi bi-arrow-right-square-fill"}
                    label={"Move forward 1 move"}
                    amount={1}
                    move={move}
                    setMove={setMove}
                    maxMove={maxMove}
                />
                <ControlMoveButton
                    className={"bi bi-fast-forward-btn-fill"}
                    label={`Fast forward ${fastForwardAmount} moves`}
                    amount={fastForwardAmount}
                    move={move}
                    setMove={setMove}
                    maxMove={maxMove}
                />
                <ControlMoveButton
                    className={"bi bi-skip-forward-btn-fill"}
                    label={"Move to the end"}
                    amount={maxMove}
                    move={move}
                    setMove={setMove}
                    maxMove={maxMove}
                />
            </FlexRow>

            <ControlUtilButton
                className={
                    showRecommendedMoves
                        ? "bi bi-eye-fill"
                        : "bi bi-eye-slash-fill"
                }
                onClick={() => {
                    setShowRecommendedMoves(!showRecommendedMoves);
                }}
                label={"Toggle show recommended move"}
            />
        </div>
    );
}

export default Controls;
