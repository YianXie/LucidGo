import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import MenuListIcon from "@mui/icons-material/Menu";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import Settings from "./Settings";

/**
 * A control panel for the game board
 * @param {number} id - the id of the board
 * @param {number} move - the current move, should be a state
 * @param {callback} setCurrentMove - the function that set the move state
 * @param {number} maxMove - the maximum possible move
 * @param {object} tools - an object that contains all the callbacks for different function buttons
 * @returns
 */
function Controls({
    id,
    currentMove,
    setCurrentMove,
    maxVisits,
    setMaxVisits,
    maxMove,
    setShowRecommendedMoves,
    showRecommendedMoves,
    setShowPolicy,
    showPolicy,
    setShowOwnership,
    showOwnership,
}) {
    const fastForwardAmount = 5;
    const [anchorEl, setAnchorEl] = useState(null);
    const [openSettings, setOpenSettings] = useState(false);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMove = (amount) => {
        setCurrentMove((prev) =>
            prev.map((value, index) => {
                if (index === id) {
                    if (value + amount > maxMove - 1 || value + amount < 1) {
                        return amount < 1 ? 1 : maxMove - 1;
                    }
                    return value + amount;
                }
                return value;
            })
        );
    };

    const options = [
        {
            label: "Show recommended moves",
            value: showRecommendedMoves,
            setValue: (newValue) => {
                setShowRecommendedMoves((prev) =>
                    prev.map((value, index) => {
                        if (index === id) {
                            return newValue;
                        }
                        return value;
                    })
                );
            },
        },
        {
            label: "Show policy",
            value: showPolicy,
            setValue: (newValue) => {
                setShowPolicy((prev) =>
                    prev.map((value, index) => {
                        if (index === id) {
                            return newValue;
                        }
                        return value;
                    })
                );
            },
        },
        {
            label: "Show ownership",
            value: showOwnership,
            setValue: (newValue) => {
                setShowOwnership((prev) =>
                    prev.map((value, index) => {
                        if (index === id) {
                            return newValue;
                        }
                        return value;
                    })
                );
            },
        },
    ];

    const handleOptionChange = (index) => {
        const option = options[index];
        // If maxChecked is 1, uncheck others
        for (let i = 0; i < options.length; i++) {
            if (i !== index) {
                options[i].setValue(false);
            }
        }
        option.setValue(true);
        handleMenuClose();
    };

    const handleSettingsClick = () => {
        handleMenuClose();
        setOpenSettings(true);
    };

    return (
        <>
            <Settings
                id={id}
                open={openSettings}
                setOpen={setOpenSettings}
                maxVisits={maxVisits}
                setMaxVisits={setMaxVisits}
            />
            <Paper
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    p: 1,
                    borderRadius: "0 0 12px 12px",
                    flexWrap: "wrap",
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
                    <IconButton
                        onClick={() => handleMove(-maxMove)}
                        disabled={currentMove <= 1}
                        aria-label="Move to the beginning"
                        size="small"
                    >
                        <SkipPreviousIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => handleMove(-fastForwardAmount)}
                        disabled={currentMove <= 1}
                        aria-label={`Rewind ${fastForwardAmount} moves`}
                        size="small"
                    >
                        <FastRewindIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => handleMove(-1)}
                        disabled={currentMove <= 1}
                        aria-label="Move backward 1 move"
                        size="small"
                    >
                        <ArrowBackIosIcon fontSize="small" />
                    </IconButton>
                </Stack>

                <Typography
                    variant="body2"
                    sx={{
                        minWidth: 40,
                        textAlign: "center",
                        fontWeight: 500,
                    }}
                >
                    {currentMove}
                </Typography>

                <Stack direction="row" spacing={0.5} sx={{ mr: "auto" }}>
                    <IconButton
                        onClick={() => handleMove(1)}
                        disabled={currentMove >= maxMove - 1}
                        aria-label="Move forward 1 move"
                        size="small"
                    >
                        <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        onClick={() => handleMove(fastForwardAmount)}
                        disabled={currentMove >= maxMove - 1}
                        aria-label={`Fast forward ${fastForwardAmount} moves`}
                        size="small"
                    >
                        <FastForwardIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => handleMove(maxMove)}
                        disabled={currentMove >= maxMove - 1}
                        aria-label="Move to the end"
                        size="small"
                    >
                        <SkipNextIcon />
                    </IconButton>
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
                            handleOptionChange(event.target.value);
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
                        <Button
                            variant="text"
                            color="inherit"
                            onClick={handleSettingsClick}
                            startIcon={<SettingsIcon />}
                            sx={{
                                width: "100%",
                                justifyContent: "flex-start",
                                textTransform: "none",
                                pl: 4,
                                fontWeight: 500,
                                fontSize: "0.875rem",
                            }}
                        >
                            Settings
                        </Button>
                    </RadioGroup>
                </Menu>
            </Paper>
        </>
    );
}

export default Controls;
