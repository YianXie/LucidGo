import IconButton from "@mui/material/IconButton";

import placeStoneSound from "../../assets/sounds/board/place-stone.wav";

/**
 * ControlMoveButton component
 * @param {React.ReactNode} icon The icon to display
 * @param {string} label The aria-label of the icon
 * @param {number} amount The amount of move to update
 * @param {function} handleMove The function to update the move
 * @param {boolean} disabled Whether the button is disabled
 * @returns {React.ReactNode} The button component
 */
function ControlMoveButton({ icon, label, amount, handleMove, disabled }) {
    const placeStoneSoundInstance = new Audio(placeStoneSound);

    return (
        <IconButton
            disabled={disabled}
            aria-label={label}
            onClick={() => {
                placeStoneSoundInstance.currentTime = 0;
                placeStoneSoundInstance.play();
                handleMove(amount);
            }}
        >
            {icon}
        </IconButton>
    );
}

export default ControlMoveButton;
