import { ConfigCheckbox } from "@/components/settings/ConfigFields";
import { GeneralSettings } from "@/types/game";

const GeneralSettingsFields = ({
    generalSettings,
    setGeneralSettings,
}: {
    generalSettings: GeneralSettings;
    setGeneralSettings: (settings: GeneralSettings) => void;
}) => {
    return (
        <ConfigCheckbox
            label="Auto-save analysis sessions"
            checked={generalSettings.auto_save_games}
            onChange={(checked) =>
                setGeneralSettings({
                    ...generalSettings,
                    auto_save_games: checked,
                })
            }
        />
    );
};

export default GeneralSettingsFields;
