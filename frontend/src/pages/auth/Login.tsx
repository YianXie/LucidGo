import AuthFormLayout from "@/components/layout/AuthFormLayout";
import TextField from "@mui/material/TextField";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../../api";
import { useAuth } from "../../contexts/AuthContext";

function Login() {
    const { login, isAuthenticated } = useAuth();
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
            const response = await api.post("/auth/token/", {
                username: data.get("username"),
                password: data.get("password"),
            });
            login(response.data);
            toast.success("Login successful");
            navigate("/");
        } catch (error: unknown) {
            if (
                isAxiosError(error) &&
                error.response?.data &&
                typeof error.response.data === "object" &&
                error.response.data !== null &&
                "detail" in error.response.data
            ) {
                toast.error(
                    String((error.response.data as { detail: unknown }).detail)
                );
            } else {
                toast.error("Login failed");
            }
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthFormLayout
            title="Sign in to LucidGo"
            submitLabel="Sign In"
            isLoading={isLoading}
            onSubmit={handleSubmit}
            linkTo="/register/"
            linkText="Create an account"
        >
            <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username or email"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
            />
            <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
            />
        </AuthFormLayout>
    );
}

export default Login;
