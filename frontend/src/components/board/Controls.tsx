import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import BackHandIcon from "@mui/icons-material/BackHand";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { FAST_FORWARD_AMOUNT } from "../../constants";
import ControlMoveButton from "./ControlMoveButton";

function Controls({
    maxMove,
    currentMoveIndex,
    allowMoveChange,
    onMoveChange,
    allowAnalyzeWithAI,
    onAnalyzeWithAI,
    allowPass,
    onPassMove,
}: {
    maxMove: number;
    currentMoveIndex: number | null;
    allowMoveChange: boolean;
    onMoveChange: (move: number) => void;
    allowAnalyzeWithAI: boolean;
    onAnalyzeWithAI: () => void;
    allowPass: boolean;
    onPassMove: () => void;
}) {
    const handleMove = (amount: number) => {
        const next = (currentMoveIndex ?? 0) + amount;
        onMoveChange(Math.max(0, Math.min(next, maxMove)));
    };
    const moveIndex = currentMoveIndex ?? 0;

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
            <Tooltip title="Analyze with AI" arrow placement="top">
                <span>
                    <IconButton
                        aria-label="Analyze with AI"
                        size="small"
                        disabled={!allowAnalyzeWithAI}
                        onClick={onAnalyzeWithAI}
                    >
                        <SmartToyIcon />
                    </IconButton>
                </span>
            </Tooltip>

            <Stack direction="row" spacing={0.5} sx={{ ml: "auto" }}>
                <ControlMoveButton
                    amount={-maxMove}
                    icon={<SkipPreviousIcon />}
                    label="Move to the beginning"
                    handleMove={handleMove}
                    disabled={moveIndex <= 0 || !allowMoveChange}
                />
                <ControlMoveButton
                    amount={-FAST_FORWARD_AMOUNT}
                    icon={<FastRewindIcon />}
                    label={`Rewind ${FAST_FORWARD_AMOUNT} moves`}
                    handleMove={handleMove}
                    disabled={moveIndex <= 0 || !allowMoveChange}
                />
                <ControlMoveButton
                    amount={-1}
                    icon={<ArrowBackIosIcon />}
                    label="Move backward 1 move"
                    handleMove={handleMove}
                    disabled={moveIndex <= 0 || !allowMoveChange}
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
                    disabled={moveIndex >= maxMove || !allowMoveChange}
                />
                <ControlMoveButton
                    amount={FAST_FORWARD_AMOUNT}
                    icon={<FastForwardIcon />}
                    label={`Fast forward ${FAST_FORWARD_AMOUNT} moves`}
                    handleMove={handleMove}
                    disabled={moveIndex >= maxMove || !allowMoveChange}
                />
                <ControlMoveButton
                    amount={maxMove}
                    icon={<SkipNextIcon />}
                    label="Move to the end"
                    handleMove={handleMove}
                    disabled={moveIndex >= maxMove || !allowMoveChange}
                />
            </Stack>

            <Tooltip title="Pass the move" arrow placement="top">
                <span>
                    <IconButton
                        aria-label="Pass the move"
                        size="small"
                        disabled={!allowPass}
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
