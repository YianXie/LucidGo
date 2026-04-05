import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

import LoadingOverlay from "../common/LoadingOverlay";

function AuthFormLayout({
    title,
    submitLabel,
    isLoading,
    onSubmit,
    linkTo,
    linkText,
    children,
}: {
    title: string;
    submitLabel: string;
    isLoading: boolean;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    linkTo: string;
    linkText: string;
    children: React.ReactNode;
}) {
    return (
        <>
            <LoadingOverlay open={isLoading} />
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Typography component="h1" variant="h5">
                    {title}
                </Typography>
                <Box
                    component="form"
                    onSubmit={onSubmit}
                    noValidate
                    sx={{ mt: 1 }}
                >
                    {children}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {submitLabel}
                    </Button>
                    <Link
                        component={RouterLink}
                        to={linkTo}
                        variant="body2"
                    >
                        {linkText}
                    </Link>
                </Box>
            </Box>
        </>
    );
}

export default AuthFormLayout;
