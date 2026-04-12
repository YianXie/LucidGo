import AuthFormLayout from "@/components/layout/AuthFormLayout";
import { EMAIL_REGEX } from "@/constants";
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
        setIsLoading(true);
        const data = new FormData(event.currentTarget);
        try {
            const email = data.get("email") as string;
            const password = data.get("password") as string;
            if (!EMAIL_REGEX.test(email)) {
                toast.error("Invalid email");
                return;
            }

            const response = await api.post("/auth/token/", {
                email: email,
                password: password,
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
