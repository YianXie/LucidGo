import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grow from "@mui/material/Grow";

const AnalysisActionButtons = ({
    isDirty,
    disabled,
    onReset,
    onSave,
    onGenerateWinrate,
    onAnalyzeCurrentMove,
    onAnalyzeAllMoves,
}: {
    isDirty: boolean;
    disabled: boolean;
    onReset: () => void;
    onSave: () => void;
    onGenerateWinrate: () => void;
    onAnalyzeCurrentMove: () => void;
    onAnalyzeAllMoves: () => void;
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 2,
                borderTop: 1,
                borderColor: "divider",
                flexShrink: 0,
            }}
        >
            {isDirty && (
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Grow in={true} timeout="auto">
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={onReset}
                            disabled={disabled}
                            fullWidth
                            sx={{
                                "&:hover": {
                                    backgroundColor: "rgba(211, 47, 47, 0.08)",
                                    borderColor: "#d32f2f",
                                },
                            }}
                        >
                            Reset
                        </Button>
                    </Grow>
                    <Grow in={true} timeout="auto">
                        <Button
                            variant="contained"
                            onClick={onSave}
                            disabled={disabled}
                            fullWidth
                        >
                            Save
                        </Button>
                    </Grow>
                </Box>
            )}
            <Button
                variant="contained"
                onClick={onGenerateWinrate}
                disabled={disabled}
                fullWidth
            >
                Generate Winrate
            </Button>
            <Button
                variant="contained"
                onClick={onAnalyzeCurrentMove}
                disabled={disabled}
                fullWidth
            >
                Analyze Current Move
            </Button>
            <Button
                variant="contained"
                onClick={onAnalyzeAllMoves}
                disabled={disabled}
                fullWidth
            >
                Analyze All Moves
            </Button>
        </Box>
    );
};

export default AnalysisActionButtons;
