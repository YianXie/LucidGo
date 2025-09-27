import { useRef, useState } from "react";
import Flex from "../global/Flex";
import ControlMoveButton from "./ControlMoveButton";
import ControlUtilButton from "./ControlUtilButton";
import CheckList from "../global/CheckList";

/**
 * A control panel for the game board
 * @param {number} move - the current move, should be a state
 * @param {callback} setMove - the function that set the move state
 * @param {number} maxMove - the maximum possible move
 * @param {object} tools - an object that contains all the callbacks for different function buttons
 * @returns
 */
function Controls({
    currentMove,
    setMove,
    maxMove,
    setShowRecommendedMoves,
    showRecommendedMoves,
    setShowPolicy,
    showPolicy,
    setShowOwnership,
    showOwnership,
}) {
    const fastForwardAmount = 5;
    const [showOptions, setShowOptions] = useState(false);
    const options = [
        {
            label: "Show recommended moves",
            value: showRecommendedMoves,
            setValue: setShowRecommendedMoves,
        },
        { label: "Show policy", value: showPolicy, setValue: setShowPolicy },
        {
            label: "Show ownership",
            value: showOwnership,
            setValue: setShowOwnership,
        },
    ];

    return (
        <div className="bg-bg-4 shadow-bg-2 relative flex w-full items-center justify-center gap-5 rounded-b-xl p-2.5 shadow-md">
            <ControlUtilButton
                className={"bi bi-arrow-clockwise"}
                onClick={() => {
                    location.reload();
                }}
                label={"Refresh your board"}
            />
            <Flex gap={2} className={"ml-auto gap-3"}>
                <ControlMoveButton
                    className={"bi bi-skip-backward-btn-fill"}
                    label={"Move to the beginning"}
                    amount={-maxMove}
                    move={currentMove}
                    setMove={setMove}
                    maxMove={maxMove}
                />
                <ControlMoveButton
                    className={"bi bi-rewind-btn-fill"}
                    label={`Rewind ${fastForwardAmount} moves`}
                    amount={-fastForwardAmount}
                    move={currentMove}
                    setMove={setMove}
                    maxMove={maxMove}
                />
                <ControlMoveButton
                    className={"bi bi-arrow-left-square-fill"}
                    label={"Move backward 1 move"}
                    amount={-1}
                    move={currentMove}
                    setMove={setMove}
                    maxMove={maxMove}
                />
            </Flex>
            <p className="text-white">{currentMove}</p>
            <Flex className="mr-auto gap-3">
                <ControlMoveButton
                    className={"bi bi-arrow-right-square-fill"}
                    label={"Move forward 1 move"}
                    amount={1}
                    move={currentMove}
                    setMove={setMove}
                    maxMove={maxMove}
                />
                <ControlMoveButton
                    className={"bi bi-fast-forward-btn-fill"}
                    label={`Fast forward ${fastForwardAmount} moves`}
                    amount={fastForwardAmount}
                    move={currentMove}
                    setMove={setMove}
                    maxMove={maxMove}
                />
                <ControlMoveButton
                    className={"bi bi-skip-forward-btn-fill"}
                    label={"Move to the end"}
                    amount={maxMove}
                    move={currentMove}
                    setMove={setMove}
                    maxMove={maxMove}
                />
            </Flex>

            <ControlUtilButton
                className="bi bi-list check-list"
                onClick={() => {
                    if (!showOptions) {
                        document.addEventListener(
                            "click",
                            function handleClick(e) {
                                e.stopPropagation();
                                if (e.target.closest(".check-list")) return;
                                setShowOptions(false);
                                document.removeEventListener(
                                    "click",
                                    handleClick
                                );
                            }
                        );
                    }
                    setShowOptions(!showOptions);
                }}
                label={"Show options"}
            />

            <CheckList
                options={options}
                maxChecked={1}
                className={`${showOptions ? "visible scale-100" : "invisible"} bg-bg-3 text-text-1 shadow-bg-2 absolute top-0 right-0 origin-bottom-right -translate-y-full scale-0 p-2 inset-shadow-sm transition-all duration-300`}
            />
        </div>
    );
}

export default Controls;
