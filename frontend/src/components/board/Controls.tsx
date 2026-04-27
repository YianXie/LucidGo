import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import BackHandIcon from "@mui/icons-material/BackHand";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import HandymanIcon from "@mui/icons-material/Handyman";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { MouseEvent, useState } from "react";

import { FAST_FORWARD_AMOUNT } from "../../constants";
import ControlMoveButton from "./ControlMoveButton";

function Controls({
    maxMove,
    live,
    currentMoveIndex,
    onMoveChange,
    onGenerateWinrate,
    onAnalyzeCurrentMove,
    onAnalyzeAllMoves,
    onPassMove,
}: {
    maxMove: number;
    live: boolean;
    currentMoveIndex: number | null;
    onMoveChange: (amount: number) => void;
    onGenerateWinrate: () => void;
    onAnalyzeCurrentMove: () => void;
    onAnalyzeAllMoves: () => void;
    onPassMove: () => void;
}) {
    const [analysisMenuAnchor, setAnalysisMenuAnchor] =
        useState<null | HTMLElement>(null);
    const analysisMenuOpen = Boolean(analysisMenuAnchor);

    const moveIndex = currentMoveIndex ?? 0;

    const handleAnalysisMenuClose = () => {
        setAnalysisMenuAnchor(null);
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
            }}
        >
            <Box>
                <Tooltip
                    title={!live ? "AI Analysis Tools" : ""}
                    arrow
                    placement="top"
                >
                    <span>
                        <IconButton
                            aria-label="Analyze with AI"
                            size="small"
                            disabled={live}
                            onClick={(event: MouseEvent<HTMLButtonElement>) => {
                                setAnalysisMenuAnchor(event.currentTarget);
                            }}
                        >
                            <HandymanIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Menu
                    open={analysisMenuOpen}
                    anchorEl={analysisMenuAnchor}
                    onClose={handleAnalysisMenuClose}
                    slotProps={{
                        list: {
                            "aria-labelledby": "basic-button",
                        },
                    }}
                >
                    <MenuItem
                        onClick={() => {
                            handleAnalysisMenuClose();
                            onGenerateWinrate();
                        }}
                    >
                        Generate win rate
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleAnalysisMenuClose();
                            onAnalyzeCurrentMove();
                        }}
                    >
                        Analyze current move
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleAnalysisMenuClose();
                            onAnalyzeAllMoves();
                        }}
                    >
                        Analyze all moves (slow)
                    </MenuItem>
                </Menu>
            </Box>

            <Stack direction="row" spacing={0.5} sx={{ ml: "auto" }}>
                <ControlMoveButton
                    amount={-maxMove}
                    icon={<SkipPreviousIcon />}
                    label="Move to the beginning"
                    onMoveChange={onMoveChange}
                    disabled={moveIndex <= 0 || live}
                />
                <ControlMoveButton
                    amount={-FAST_FORWARD_AMOUNT}
                    icon={<FastRewindIcon />}
                    label={`Rewind ${FAST_FORWARD_AMOUNT} moves`}
                    onMoveChange={onMoveChange}
                    disabled={moveIndex <= 0 || live}
                />
                <ControlMoveButton
                    amount={-1}
                    icon={<ArrowBackIosIcon />}
                    label="Move backward 1 move"
                    onMoveChange={onMoveChange}
                    disabled={moveIndex <= 0 || live}
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
                    onMoveChange={onMoveChange}
                    disabled={moveIndex >= maxMove || live}
                />
                <ControlMoveButton
                    amount={FAST_FORWARD_AMOUNT}
                    icon={<FastForwardIcon />}
                    label={`Fast forward ${FAST_FORWARD_AMOUNT} moves`}
                    onMoveChange={onMoveChange}
                    disabled={moveIndex >= maxMove || live}
                />
                <ControlMoveButton
                    amount={maxMove}
                    icon={<SkipNextIcon />}
                    label="Move to the end"
                    onMoveChange={onMoveChange}
                    disabled={moveIndex >= maxMove || live}
                />
            </Stack>

            <Tooltip title={live ? "Pass the move" : ""} arrow placement="top">
                <span>
                    <IconButton
                        aria-label="Pass the move"
                        size="small"
                        disabled={!live}
                        onClick={onPassMove}
                    >
                        <BackHandIcon />
                    </IconButton>
                </span>
            </Tooltip>
        </Paper>
    );
}

export default Controls;
