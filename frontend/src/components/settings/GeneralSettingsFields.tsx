import { GeneralSettings } from "@/types/game";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";

const GeneralSettingsFields = ({
    generalSettings,
    setGeneralSettings,
}: {
    generalSettings: GeneralSettings;
    setGeneralSettings: (settings: GeneralSettings) => void;
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
            }}
        >
            <Checkbox
                checked={generalSettings.auto_save_games}
                onChange={(event) => {
                    setGeneralSettings({
                        ...generalSettings,
                        auto_save_games: event.target.checked,
                    });
                }}
            />
            <Typography>Auto-save analysis sessions</Typography>
        </Box>
    );
};

export default GeneralSettingsFields;
