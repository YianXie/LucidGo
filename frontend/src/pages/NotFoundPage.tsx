import HomeIcon from "@mui/icons-material/Home";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";

import usePageTitle from "../hooks/usePageTitle";

function NotFoundPage() {
    usePageTitle("404 Not Found");

    return (
        <Container>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "calc(100vh - 100px)",
                    textAlign: "center",
                }}
            >
                <Stack spacing={3} alignItems="center">
                    <Typography variant="h1" component="h1" fontWeight={700}>
                        404
                    </Typography>
                    <Typography
                        variant="h4"
                        component="h2"
                        color="text.secondary"
                    >
                        Page Not Found
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        The page you are looking for does not exist.
                    </Typography>
                    <Button
                        component={Link}
                        to="/"
                        variant="contained"
                        startIcon={<HomeIcon />}
                        size="large"
                        sx={{ mt: 2 }}
                    >
                        Go back to the home page
                    </Button>
                </Stack>
            </Box>
        </Container>
    );
}

export default NotFoundPage;
