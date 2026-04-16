import placeStoneSoundInstance from "@/assets/sounds/placeStoneSoundInstance";
import IconButton from "@mui/material/IconButton";
import type { ReactNode } from "react";

function ControlMoveButton({
    icon,
    label,
    amount,
    handleMove,
    disabled,
}: {
    icon: ReactNode;
    label: string;
    amount: number;
    handleMove: (amount: number) => void;
    disabled: boolean;
}) {
    return (
        <span>
            <IconButton
                disabled={disabled}
                aria-label={label}
                onClick={() => {
                    placeStoneSoundInstance.currentTime = 0;
                    void placeStoneSoundInstance.play();
                    handleMove(amount);
                }}
            >
                {icon}
            </IconButton>
        </span>
    );
}

export default ControlMoveButton;
