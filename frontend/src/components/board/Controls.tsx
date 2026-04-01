import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import MenuListIcon from "@mui/icons-material/Menu";
import RefreshIcon from "@mui/icons-material/Refresh";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import ControlMoveButton from "./ControlMoveButton";

function Controls({
    boardIdx,
    maxMove,
    disabled,
    currentMove,
    setCurrentMove,
    setShowRecommendedMoves,
    showRecommendedMoves,
}: {
    boardIdx: number;
    maxMove: number;
    disabled: boolean;
    currentMove: number | null;
    setCurrentMove: Dispatch<SetStateAction<(number | null)[]>>;
    setShowRecommendedMoves: Dispatch<SetStateAction<boolean[]>>;
    showRecommendedMoves: boolean;
}) {
    const fastForwardAmount = 5;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMove = (amount: number) => {
        setCurrentMove((prev) =>
            prev.map((value, index) => {
                if (index !== boardIdx) return value;
                const v = value ?? 0;
                const next = v + amount;
                if (next > maxMove || next < 0) {
                    return amount < 0 ? 0 : maxMove;
                }
                return next;
            })
        );
    };

    const moveIndex = currentMove ?? 0;

    const options = [
        {
            label: "Show recommended moves",
            value: showRecommendedMoves,
            setValue: (newValue: boolean) => {
                setShowRecommendedMoves((prev) =>
                    prev.map((value, index) => {
                        if (index === boardIdx) {
                            return newValue;
                        }
                        return value;
                    })
                );
            },
        },
    ];

    const handleOptionChange = (index: number) => {
        const option = options[index];
        for (let i = 0; i < options.length; i++) {
            if (i !== index) {
                options[i].setValue(false);
            }
        }
        option.setValue(true);
        handleMenuClose();
    };

    return (
        <Paper
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                p: 1,
                borderRadius: "0 0 12px 12px",
                flexWrap: "wrap",
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? "none" : "auto",
            }}
        >
            <IconButton
                onClick={() => {
                    location.reload();
                }}
                aria-label="Refresh your board"
                size="small"
            >
                <RefreshIcon />
            </IconButton>

            <Stack direction="row" spacing={0.5} sx={{ ml: "auto" }}>
                <ControlMoveButton
                    amount={-maxMove}
                    icon={<SkipPreviousIcon />}
                    label="Move to the beginning"
                    handleMove={handleMove}
                    disabled={moveIndex <= 0}
                />
                <ControlMoveButton
                    amount={-fastForwardAmount}
                    icon={<FastRewindIcon />}
                    label={`Rewind ${fastForwardAmount} moves`}
                    handleMove={handleMove}
                    disabled={moveIndex <= 0}
                />
                <ControlMoveButton
                    amount={-1}
                    icon={<ArrowBackIosIcon />}
                    label="Move backward 1 move"
                    handleMove={handleMove}
                    disabled={moveIndex <= 0}
                />
            </Stack>

            <Typography
                variant="body2"
                sx={{
                    minWidth: 40,
                    textAlign: "center",
                    fontWeight: 500,
                }}
            >
                {moveIndex}
            </Typography>

            <Stack direction="row" spacing={0.5} sx={{ mr: "auto" }}>
                <ControlMoveButton
                    amount={1}
                    icon={<ArrowForwardIosIcon fontSize="small" />}
                    label="Move forward 1 move"
                    handleMove={handleMove}
                    disabled={moveIndex >= maxMove}
                />
                <ControlMoveButton
                    amount={fastForwardAmount}
                    icon={<FastForwardIcon />}
                    label={`Fast forward ${fastForwardAmount} moves`}
                    handleMove={handleMove}
                    disabled={moveIndex >= maxMove}
                />
                <ControlMoveButton
                    amount={maxMove}
                    icon={<SkipNextIcon />}
                    label="Move to the end"
                    handleMove={handleMove}
                    disabled={moveIndex >= maxMove}
                />
            </Stack>

            <IconButton
                onClick={handleMenuClick}
                aria-label="Show options"
                size="small"
            >
                <MenuListIcon />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
            >
                <RadioGroup
                    value={options.findIndex((option) => option.value)}
                    onChange={(event) => {
                        handleOptionChange(Number(event.target.value));
                    }}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                    }}
                >
                    {options.map((option, index) => (
                        <FormControlLabel
                            key={index}
                            value={index}
                            control={<Radio />}
                            label={option.label}
                            sx={{
                                width: "100%",
                                px: 2,
                                margin: 0,
                                "&:hover": {
                                    backgroundColor: "action.hover",
                                },
                            }}
                        />
                    ))}
                </RadioGroup>
            </Menu>
        </Paper>
    );
}

export default Controls;
