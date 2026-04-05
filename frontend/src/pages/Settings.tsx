import AnalysisConfigFields from "@/components/analysis/AnalysisConfigFields";
import { DEFAULT_ANALYSIS_CONFIG } from "@/constants";
import type { AnalysisConfig } from "@/types/game";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { type AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import usePageTitle from "../hooks/usePageTitle";

function Settings() {
    usePageTitle("Settings");

    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [oldPassword, setOldPassword] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<string | null>(null);
    const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>(
        DEFAULT_ANALYSIS_CONFIG
    );

    useEffect(() => {
        if (user) {
            setUsername((user.username as string) || "");
            setEmail((user.email as string) || "");
        }
    }, [user]);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const { data } = await api.get("/auth/user/analysis-config/");
                if (data.analysis_config) {
                    setAnalysisConfig(data.analysis_config);
                }
            } catch {
                // Use defaults if fetch fails
            }
        }
        fetchSettings();
    }, []);

    function getErrorMessage(err: unknown): string {
        const error = err as AxiosError<Record<string, unknown>>;
        if (error.response?.data) {
            const data = error.response.data;
            const firstKey = Object.keys(data)[0];
            const value = data[firstKey];
            if (Array.isArray(value)) return value[0] as string;
            if (typeof value === "string") return value;
            return JSON.stringify(value);
        }
        return "An unexpected error occurred.";
    }

    async function handleUpdateUsername() {
        setLoading("username");
        try {
            const { data } = await api.patch("/auth/user/username/", {
                username,
            });
            login(data);
            toast.success("Username updated successfully.");
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(null);
        }
    }

    async function handleUpdateEmail() {
        setLoading("email");
        try {
            const { data } = await api.patch("/auth/user/email/", { email });
            login(data);
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
            login(data);
            setOldPassword("");
            setPassword("");
            toast.success("Password updated successfully.");
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(null);
        }
    }

    async function handleSaveConfig() {
        setLoading("config");
        try {
            await api.put("/auth/user/analysis-config/", {
                analysis_config: analysisConfig,
            });
            toast.success("Analysis configuration saved.");
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(null);
        }
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
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 2,
                py: 4,
            }}
        >
            <Typography variant="h2" component="h1" fontWeight={600}>
                Settings
            </Typography>
            <Divider />
            <Box sx={{ my: 2 }}>
                <Typography variant="h4" component="h2" fontWeight={500}>
                    Account
                </Typography>
                <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <TextField
                            variant="standard"
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpdateUsername}
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
                </Stack>
            </Box>
            <Box sx={{ my: 2 }}>
                <Typography variant="h4" component="h2" fontWeight={500}>
                    Default Analysis Configuration
                </Typography>
                <AnalysisConfigFields
                    analysisConfig={analysisConfig}
                    onChange={setAnalysisConfig}
                />
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ width: "100px", mt: 2 }}
                    onClick={handleSaveConfig}
                    disabled={loading !== null}
                >
                    Save
                </Button>
            </Box>
            <Box sx={{ my: 2 }}>
                <Typography variant="h4" component="h2" fontWeight={500}>
                    Dangerous Zone
                </Typography>
                <Button
                    variant="contained"
                    color="error"
                    sx={{ mt: 2 }}
                    onClick={handleDeleteAccount}
                    disabled={loading !== null}
                >
                    Delete Account
                </Button>
            </Box>
        </Box>
    );
}

export default Settings;
