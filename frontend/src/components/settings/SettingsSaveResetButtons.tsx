import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const SettingsSaveResetButtons = ({
    onSave,
    onReset,
    saveDisabled,
    resetDisabled,
}: {
    onSave: () => void;
    onReset: () => void;
    saveDisabled: boolean;
    resetDisabled: boolean;
}) => {
    return (
        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button
                variant="contained"
                color="primary"
                sx={{ width: "fit-content", px: 4 }}
                onClick={onSave}
                disabled={saveDisabled}
            >
                Save
            </Button>
            <Button
                variant="outlined"
                color="error"
                sx={{ width: "fit-content", px: 4 }}
                onClick={onReset}
                disabled={resetDisabled}
            >
                Reset to Defaults
            </Button>
        </Box>
    );
};

export default SettingsSaveResetButtons;
