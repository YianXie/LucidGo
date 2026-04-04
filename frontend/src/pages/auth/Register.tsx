import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../../api";
import { useAuth } from "../../contexts/AuthContext";

function formatErrorPayload(data: Record<string, unknown>): string {
    if ("detail" in data && data.detail !== undefined) {
        return String(data.detail);
    }
    const parts = Object.entries(data).flatMap(([key, value]) => {
        if (Array.isArray(value)) {
            return value.map((item) => `${key}: ${String(item)}`);
        }
        return [`${key}: ${String(value)}`];
    });
    return parts.join("; ") || "Request failed";
}

function Register() {
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
            setIsLoading(true);
            await api.post("/auth/register/", {
                email: data.get("email"),
                username: data.get("username"),
                password: data.get("password"),
            });
            toast.success("Account created. You can sign in now.");
            navigate("/login/");
        } catch (error: unknown) {
            if (
                isAxiosError(error) &&
                error.response?.data &&
                typeof error.response.data === "object" &&
                error.response.data !== null
            ) {
                toast.error(
                    formatErrorPayload(
                        error.response.data as Record<string, unknown>
                    )
                );
            } else {
                toast.error("Registration failed");
            }
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && (
                <Backdrop
                    open={true}
                    sx={{
                        color: "#fff",
                        zIndex: (theme) => theme.zIndex.appBar - 1,
                    }}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            )}
            <Container component="main" maxWidth="xs">
                <Box
                    sx={{
                        marginTop: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Typography component="h1" variant="h5">
                        Create an account
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{ mt: 1 }}
                    >
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            type="text"
                            autoComplete="username"
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Register
                        </Button>
                        <Link
                            component={RouterLink}
                            to="/login/"
                            variant="body2"
                        >
                            Already have an account? Sign in
                        </Link>
                    </Box>
                </Box>
            </Container>
        </>
    );
}

export default Register;
