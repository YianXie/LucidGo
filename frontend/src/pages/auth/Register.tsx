import AuthFormLayout from "@/components/layout/AuthFormLayout";
import { formatErrorPayload } from "@/utils/errorFormatting";
import useRedirectIfAuthenticated from "@/hooks/useRedirectIfAuthenticated";
import TextField from "@mui/material/TextField";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../../api";

const Register = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useRedirectIfAuthenticated();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        if (data.get("password") !== data.get("password_confirmation")) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setIsLoading(true);
            await api.post("/auth/register/", {
                email: data.get("email"),
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
        <AuthFormLayout
            title="Create an account"
            submitLabel="Register"
            isLoading={isLoading}
            onSubmit={handleSubmit}
            linkTo="/login/"
            linkText="Already have an account? Sign in"
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
                autoComplete="new-password"
            />
            <TextField
                margin="normal"
                required
                fullWidth
                name="password_confirmation"
                label="Password Confirmation"
                type="password"
                id="password_confirmation"
                autoComplete="new-password"
            />
        </AuthFormLayout>
    );
};

export default Register;
