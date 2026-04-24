import placeStoneSoundInstance from "@/assets/sounds/placeStoneSoundInstance";
import IconButton from "@mui/material/IconButton";
import type { ReactNode } from "react";

function ControlMoveButton({
    icon,
    label,
    amount,
    onMoveChange,
    disabled,
}: {
    icon: ReactNode;
    label: string;
    amount: number;
    onMoveChange: (amount: number) => void;
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
                    onMoveChange(amount);
                }}
            >
                {icon}
            </IconButton>
        </span>
    );
}

export default ControlMoveButton;
