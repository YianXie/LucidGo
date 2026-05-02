import { useAuth } from "@/contexts/AuthContext";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

import demoPicture from "../assets/images/home/demo.png";
import useHover from "../hooks/useHover";
import usePageTitle from "../hooks/usePageTitle";

const Home = () => {
    usePageTitle("Home");

    const { isAuthenticated } = useAuth();
    const [imageHovered, hoverProps] = useHover();
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
            }}
        >
            <Typography
                variant="h2"
                component="h1"
                sx={{
                    fontWeight: 600,
                    textAlign: "center",
                }}
            >
                Welcome to LucidGo
            </Typography>
            <Typography
                variant="body1"
                sx={{
                    textAlign: "center",
                    my: 2,
                }}
            >
                LucidGo is a full-stack web application that allows you to play
                Go with a trained AI, or analyze your own games with AI
                assistance.
            </Typography>

            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mt: 4 }}
            >
                <Button
                    variant="contained"
                    size="large"
                    onClick={() =>
                        navigate(isAuthenticated ? "/analyze" : "/demo")
                    }
                    sx={{
                        px: 4,
                        py: 1.5,
                        textTransform: "none",
                        fontSize: "1rem",
                    }}
                >
                    {isAuthenticated ? "Analyze" : "Demo"}
                </Button>
                <Button
                    variant="outlined"
                    size="large"
                    onClick={() =>
                        window.open(
                            "https://github.com/YianXie/LucidGo",
                            "_blank"
                        )
                    }
                    sx={{
                        px: 4,
                        py: 1.5,
                        textTransform: "none",
                        fontSize: "1rem",
                    }}
                >
                    GitHub
                </Button>
            </Stack>

            <Card
                sx={{
                    maxWidth: 800,
                    width: "100%",
                    cursor: "pointer",
                    position: "relative",
                    mt: 4,
                }}
                onClick={() => navigate(isAuthenticated ? "/analyze" : "/demo")}
                {...hoverProps}
            >
                <CardActionArea>
                    <CardMedia
                        component="img"
                        image={demoPicture}
                        alt="demo picture"
                        sx={{
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                        }}
                    />
                    {imageHovered && (
                        <CardContent
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "rgba(0, 0, 0, 0.6)",
                                color: "white",
                                backdropFilter: "blur(4px)",
                                animation: "fadeIn 0.3s ease",
                                "@keyframes fadeIn": {
                                    from: {
                                        opacity: 0,
                                    },
                                    to: {
                                        opacity: 1,
                                    },
                                },
                            }}
                        >
                            <OpenInNewIcon sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h5" fontWeight={500}>
                                {isAuthenticated
                                    ? "Start analyzing"
                                    : "Try it out"}
                            </Typography>
                        </CardContent>
                    )}
                </CardActionArea>
            </Card>
        </Box>
    );
};

export default Home;
