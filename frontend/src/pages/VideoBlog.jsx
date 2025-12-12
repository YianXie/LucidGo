import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState } from "react";
import { useParams } from "react-router-dom";

import Container from "../components/global/Container";
import Video from "../components/videos/Video";
import VideoSidebar from "../components/videos/VideoSidebar";
import VideoSidebarLink from "../components/videos/VideoSidebarLink";
import { videoData } from "../constants";
import { capitalize } from "../utils";

const drawerWidth = 256;

function VideoBlog() {
    const { videoId } = useParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const sidebarContent = (
        <VideoSidebar>
            {Object.keys(videoData).map((key) => (
                <VideoSidebarLink
                    key={key}
                    to={`/video-blog/${key}`}
                    isActive={videoId === key}
                >
                    {capitalize(key)}
                </VideoSidebarLink>
            ))}
        </VideoSidebar>
    );

    return (
        <Container>
            <Box sx={{ display: "flex", height: "calc(100vh - 100px)" }}>
                {isMobile ? (
                    <>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{
                                position: "fixed",
                                top: 80,
                                left: 16,
                                zIndex: 1300,
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Drawer
                            variant="temporary"
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            ModalProps={{
                                keepMounted: true,
                            }}
                            sx={{
                                display: { xs: "block", md: "none" },
                                "& .MuiDrawer-paper": {
                                    boxSizing: "border-box",
                                    width: drawerWidth,
                                },
                            }}
                        >
                            {sidebarContent}
                        </Drawer>
                    </>
                ) : (
                    <Box
                        sx={{
                            width: drawerWidth,
                            flexShrink: 0,
                        }}
                    >
                        {sidebarContent}
                    </Box>
                )}

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        overflowY: "auto",
                        p: 3,
                    }}
                >
                    {videoId && videoData[videoId] ? (
                        <Stack spacing={3} alignItems="center">
                            <Typography
                                variant="h4"
                                component="h1"
                                fontWeight={600}
                            >
                                {capitalize(videoId)}
                            </Typography>
                            <Box
                                sx={{
                                    width: "100%",
                                    maxWidth: 800,
                                    "& iframe": {
                                        width: "100%",
                                        height: { xs: 250, sm: 400, md: 500 },
                                    },
                                }}
                            >
                                <Video link={videoData[videoId]} />
                            </Box>
                        </Stack>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                height: "100%",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Stack spacing={2} alignItems="center">
                                <Typography
                                    variant="h3"
                                    component="h1"
                                    fontWeight={600}
                                >
                                    Welcome to the Video Blog!
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                >
                                    Select a video from the sidebar to watch.
                                </Typography>
                            </Stack>
                        </Box>
                    )}
                </Box>
            </Box>
        </Container>
    );
}

export default VideoBlog;
