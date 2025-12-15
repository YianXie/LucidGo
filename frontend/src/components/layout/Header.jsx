import GitHubIcon from "@mui/icons-material/GitHub";
import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Slide from "@mui/material/Slide";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { GitHubRepositoryLink } from "../../constants";
import { useAuth } from "../../contexts/AuthContext";
import logo from "/logo.png";

function HideOnScroll({ children }) {
    const trigger = useScrollTrigger({
        target: window,
        threshold: 100,
    });
    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const navItems = [
        { label: "Docs", path: "/docs" },
        { label: "Video Blog", path: "/video-blog" },
        { label: "Demo", path: "/demo" },
        ...(isAuthenticated
            ? [{ label: "Logout", path: "/logout" }]
            : [{ label: "Login", path: "/login" }]),
    ];

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton
                            onClick={() => navigate(item.path)}
                            selected={location.pathname === item.path}
                            sx={{
                                textAlign: "center",
                                "&.Mui-selected": {
                                    backgroundColor: "action.selected",
                                },
                            }}
                        >
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() =>
                            window.open(GitHubRepositoryLink, "_blank")
                        }
                        sx={{ textAlign: "center" }}
                    >
                        <ListItemText primary="GitHub" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
            <HideOnScroll>
                <AppBar
                    sx={{
                        position: "sticky",
                        top: 0,
                        width: "100%",
                        backgroundColor: "background.paper",
                        color: "text.primary",
                        boxShadow: 4,
                    }}
                >
                    <Toolbar sx={{ justifyContent: "space-between" }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                cursor: "pointer",
                            }}
                            onClick={() => navigate("/")}
                        >
                            <img
                                src={logo}
                                alt="Logo"
                                style={{ height: 40, width: 40 }}
                            />
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{ fontWeight: 500 }}
                            >
                                LucidGo
                            </Typography>
                        </Box>

                        {isMobile ? (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                            >
                                <MenuIcon />
                            </IconButton>
                        ) : (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                {navItems.map((item) => (
                                    <Button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        color={
                                            location.pathname === item.path
                                                ? "primary"
                                                : "inherit"
                                        }
                                        sx={{
                                            textTransform: "none",
                                            textDecoration:
                                                location.pathname === item.path
                                                    ? "underline"
                                                    : "none",
                                        }}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                                <Tooltip title="GitHub Repository" arrow>
                                    <IconButton
                                        onClick={() =>
                                            window.open(
                                                GitHubRepositoryLink,
                                                "_blank"
                                            )
                                        }
                                        color="inherit"
                                        aria-label="GitHub Repository"
                                    >
                                        <GitHubIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        )}
                    </Toolbar>
                </AppBar>
            </HideOnScroll>
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: 240,
                    },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
}

export default Header;
