import Sidebar from "@/components/common/Sidebar";
import SidebarLink from "@/components/common/SidebarLink";
import SidebarLayout from "@/components/layout/SidebarLayout";
import AnalysisConfigFields from "@/components/settings/AnalysisConfigFields";
import { DEFAULT_ANALYSIS_CONFIG } from "@/constants";
import type { AnalysisConfig } from "@/types/game";
import { getErrorMessage } from "@/utils/errorFormatting";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import usePageTitle from "../hooks/usePageTitle";

function Settings() {
    usePageTitle("Settings");

    const { user, login, logout, defaultAnalysisConfig } = useAuth();
    const { id } = useParams();
    const location = useLocation();
    const [email, setEmail] = useState<string>(user?.email as string);
    const [oldPassword, setOldPassword] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<string | null>(null);
    const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>(
        defaultAnalysisConfig
    );
    const navigate = useNavigate();

    useEffect(() => {
        setAnalysisConfig(defaultAnalysisConfig);
    }, [defaultAnalysisConfig]);

    const accountContent = (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <TextField
                    variant="standard"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateEmail}
                    disabled={loading !== null}
                >
                    Update
                </Button>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <TextField
                    variant="standard"
                    label="Current Password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />
                <TextField
                    variant="standard"
                    label="New Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdatePassword}
                    disabled={loading !== null}
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

    const analysisConfigContent = (
        <Box sx={{ my: 2 }}>
            <AnalysisConfigFields
                analysisConfig={analysisConfig}
                onChange={setAnalysisConfig}
            />
            <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ width: "fit-content", px: 4 }}
                    onClick={() => void handleSaveConfig()}
                    disabled={loading !== null}
                >
                    Save
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    sx={{ width: "fit-content", px: 4 }}
                    onClick={handleResetConfig}
                    disabled={loading !== null}
                >
                    Reset
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

    const selectedContent = pages.find((page) => page.id === id)?.content;

    async function handleUpdateEmail() {
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
    }

    async function handleUpdatePassword() {
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
    }

    async function handleSaveConfig(overrideAnalysisConfig?: AnalysisConfig) {
        setLoading("config");
        const analysis_config = overrideAnalysisConfig ?? analysisConfig;
        try {
            await api.put("/auth/user/analysis-config/", {
                analysis_config,
            });
            if (overrideAnalysisConfig !== undefined) {
                setAnalysisConfig(overrideAnalysisConfig);
            }
            toast.success("Analysis configuration saved.");
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(null);
        }
    }

    async function handleResetConfig() {
        if (
            !window.confirm(
                "Are you sure you want to reset the analysis configuration? This action cannot be undone."
            )
        ) {
            return;
        }
        await handleSaveConfig(DEFAULT_ANALYSIS_CONFIG);
    }

    async function handleDeleteAccount() {
        if (
            !window.confirm(
                "Are you sure you want to delete your account? This action cannot be undone."
            )
        ) {
            return;
        }
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
    }

    return (
        <SidebarLayout
            sidebar={sidebarContent}
            hasContent={!!selectedContent}
            welcomeTitle="Welcome to the settings page"
            welcomeSubtitle="Click on a settings to read it."
        >
            {selectedContent}
        </SidebarLayout>
    );
}

export default Settings;
