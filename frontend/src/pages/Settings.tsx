import Sidebar from "@/components/common/Sidebar";
import SidebarLink from "@/components/common/SidebarLink";
import SidebarLayout from "@/components/layout/SidebarLayout";
import AnalysisConfigFields from "@/components/settings/AnalysisConfigFields";
import GeneralSettingsFields from "@/components/settings/GeneralSettingsFields";
import { DEFAULT_USER_SETTINGS, USER_SETTINGS_URL } from "@/constants";
import type {
    AnalysisConfig,
    GeneralSettings,
    UserSettings,
} from "@/types/game";
import { getErrorMessage } from "@/utils/errorFormatting";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import usePageTitle from "../hooks/usePageTitle";

const Settings = () => {
    usePageTitle("Settings");

    const { user, userSettings, setUserSettings, login, logout } = useAuth();
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<string | null>(null);
    const [email, setEmail] = useState<string>(user?.email as string);
    const [oldPassword, setOldPassword] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [draftGeneralSettings, setDraftGeneralSettings] =
        useState<GeneralSettings>(userSettings.general_settings);
    const [draftAnalysisConfig, setDraftAnalysisConfig] =
        useState<AnalysisConfig>(userSettings.analysis_config);

    const generalSettingsDirty =
        JSON.stringify(draftGeneralSettings) !==
        JSON.stringify(userSettings.general_settings);
    const analysisConfigDirty =
        JSON.stringify(draftAnalysisConfig) !==
        JSON.stringify(userSettings.analysis_config);

    const handleUpdateEmail = async () => {
        setLoading("email");
        try {
            const { data } = await api.patch("/auth/user/email/", { email });
            await login(data);
            toast.success("Email updated successfully.");
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(null);
        }
    };

    const handleUpdatePassword = async () => {
        setLoading("password");
        try {
            const { data } = await api.put("/auth/user/password/", {
                old_password: oldPassword,
                new_password: password,
            });
            await login(data);
            setOldPassword("");
            setPassword("");
            toast.success("Password updated successfully.");
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(null);
        }
    };

    const handleDeleteAccount = async () => {
        if (
            !window.confirm(
                "Are you sure you want to delete your account? This action cannot be undone."
            )
        )
            return;
        setLoading("delete");
        try {
            await api.delete("/auth/user/delete/");
            logout();
            navigate("/");
            toast.success("Account deleted successfully.");
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(null);
        }
    };

    const handleSaveGeneralSettings = async (override?: GeneralSettings) => {
        setLoading("general");
        const generalSettings = override ?? draftGeneralSettings;
        const newSettings: UserSettings = {
            general_settings: generalSettings,
            analysis_config: userSettings.analysis_config,
        };
        try {
            await api.put(USER_SETTINGS_URL, newSettings);
            setUserSettings(newSettings);
            if (override !== undefined) setDraftGeneralSettings(override);
            toast.success("General settings saved.");
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(null);
        }
    };

    const handleSaveAnalysisConfig = async (override?: AnalysisConfig) => {
        setLoading("config");
        const analysisConfig = override ?? draftAnalysisConfig;
        const newSettings: UserSettings = {
            general_settings: userSettings.general_settings,
            analysis_config: analysisConfig,
        };
        try {
            await api.put(USER_SETTINGS_URL, newSettings);
            setUserSettings(newSettings);
            if (override !== undefined) setDraftAnalysisConfig(override);
            toast.success("Analysis configuration saved.");
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(null);
        }
    };

    const handleResetGeneralSettings = async () => {
        if (
            !window.confirm(
                "Are you sure you want to reset your general settings? This action cannot be undone."
            )
        )
            return;
        await handleSaveGeneralSettings(DEFAULT_USER_SETTINGS.general_settings);
    };

    const handleResetAnalysisConfig = async () => {
        if (
            !window.confirm(
                "Are you sure you want to reset the analysis configuration? This action cannot be undone."
            )
        )
            return;
        await handleSaveAnalysisConfig(DEFAULT_USER_SETTINGS.analysis_config);
    };

    const accountContent = (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: { xs: "stretch", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    width: "400px",
                }}
            >
                <TextField
                    variant="standard"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ flexGrow: 1 }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateEmail}
                    disabled={loading !== null}
                    sx={{
                        flexShrink: 0,
                        alignSelf: { xs: "flex-start", sm: "center" },
                    }}
                >
                    Update
                </Button>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    alignItems: { xs: "stretch", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    width: "800px",
                }}
            >
                <TextField
                    variant="standard"
                    label="Current Password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    sx={{ flexGrow: 1 }}
                />
                <TextField
                    variant="standard"
                    label="New Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ flexGrow: 1 }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdatePassword}
                    disabled={loading !== null}
                    sx={{
                        flexShrink: 0,
                        alignSelf: { xs: "flex-start", sm: "center" },
                    }}
                >
                    Update
                </Button>
            </Box>
            <Button
                variant="contained"
                color="error"
                onClick={handleDeleteAccount}
                disabled={loading !== null}
                sx={{ width: "fit-content", mt: 2 }}
            >
                Delete Account
            </Button>
        </Box>
    );

    const generalSettingsContent = (
        <Box sx={{ my: 2 }}>
            <GeneralSettingsFields
                generalSettings={draftGeneralSettings}
                setGeneralSettings={setDraftGeneralSettings}
            />
            <Typography>More settings are coming...</Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ width: "fit-content", px: 4 }}
                    onClick={() => void handleSaveGeneralSettings()}
                    disabled={loading !== null || !generalSettingsDirty}
                >
                    Save
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    sx={{ width: "fit-content", px: 4 }}
                    onClick={() => void handleResetGeneralSettings()}
                    disabled={loading !== null}
                >
                    Reset to Defaults
                </Button>
            </Box>
        </Box>
    );

    const analysisConfigContent = (
        <Box sx={{ my: 2 }}>
            <AnalysisConfigFields
                analysisConfig={draftAnalysisConfig}
                setAnalysisConfig={setDraftAnalysisConfig}
            />
            <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ width: "fit-content", px: 4 }}
                    onClick={() => void handleSaveAnalysisConfig()}
                    disabled={loading !== null || !analysisConfigDirty}
                >
                    Save
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    sx={{ width: "fit-content", px: 4 }}
                    onClick={() => void handleResetAnalysisConfig()}
                    disabled={loading !== null}
                >
                    Reset to Defaults
                </Button>
            </Box>
        </Box>
    );

    const pages = [
        {
            id: "account",
            title: "Account",
            content: accountContent,
        },
        {
            id: "general-settings",
            title: "General Settings",
            content: generalSettingsContent,
        },
        {
            id: "analysis-config",
            title: "Default Analysis Configuration",
            content: analysisConfigContent,
        },
    ];

    const sidebarContent = (
        <Sidebar title="Settings">
            {pages.map((page) => (
                <SidebarLink
                    key={page.id}
                    to={`/settings/${page.id}`}
                    isActive={location.pathname === `/settings/${page.id}`}
                >
                    {page.title}
                </SidebarLink>
            ))}
        </Sidebar>
    );

    const selectedPage = pages.find((page) => page.id === id);

    return (
        <SidebarLayout
            sidebar={sidebarContent}
            hasContent={!!selectedPage}
            welcomeTitle="Welcome to the settings page"
            welcomeSubtitle="Click on a settings to read it."
        >
            {selectedPage && (
                <Box>
                    <Typography
                        variant="h3"
                        component="h1"
                        fontWeight={600}
                        gutterBottom
                    >
                        {selectedPage.title}
                    </Typography>
                    {selectedPage.content}
                </Box>
            )}
        </SidebarLayout>
    );
};

export default Settings;
