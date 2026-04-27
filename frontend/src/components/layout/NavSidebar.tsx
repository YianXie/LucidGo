import { useAuth } from "@/contexts/AuthContext";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import FeedbackIcon from "@mui/icons-material/Feedback";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import logo from "/logo.png";

function NavSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(
        null
    );
    const { isAuthenticated, user } = useAuth();

    const analyzeLink = isAuthenticated ? "/analyze" : "/demo";

    const navItems = [
        { icon: <HomeIcon />, label: "Home", path: "/" },
        {
            icon: <BarChartIcon />,
            label: isAuthenticated ? "Analyze" : "Demo",
            path: analyzeLink,
        },
        { icon: <DescriptionIcon />, label: "Docs", path: "/docs" },
    ];

    const accountMenuItems = [
        { label: "Profile", icon: <PersonIcon />, path: "/profile" },
        { label: "Settings", icon: <SettingsIcon />, path: "/settings" },
        {
            label: "Feedback Form",
            icon: <FeedbackIcon />,
            path: "https://forms.gle/UUfoY7uhRBXSqvux8",
        },
        { label: "Logout", icon: <LogoutIcon />, path: "/logout" },
    ];

    const isActive = (path: string) =>
        path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(path);

    if (!isMobile) {
        return (
            <Box
                sx={{
                    flexShrink: 0,
                    backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                            ? alpha(theme.palette.common.white, 0.1)
                            : theme.palette.grey[100],
                    borderRight: 1,
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    boxShadow: 1,
                    py: 1.5,
                    px: 0.5,
                    gap: 0.5,
                    height: "100vh",
                    position: "sticky",
                    top: 0,
                    zIndex: (t) => t.zIndex.drawer,
                }}
            >
                {navItems.map((item) => (
                    <Tooltip
                        key={item.path}
                        title={item.label}
                        placement="right"
                        arrow
                    >
                        <IconButton
                            size="medium"
                            onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: "50%",
                            }}
                        >
                            {item.icon}
                        </IconButton>
                    </Tooltip>
                ))}

                <Box sx={{ flex: 1 }} />

                {/* Account avatar */}
                <Tooltip
                    title={isAuthenticated ? "Account" : "Login / Register"}
                    placement="right"
                    arrow
                >
                    <IconButton
                        onClick={(e) => setAccountAnchor(e.currentTarget)}
                        sx={{ p: 0.5 }}
                    >
                        <Avatar
                            sizes="small"
                            sx={{
                                width: 34,
                                height: 34,
                                bgcolor: "primary.main",
                            }}
                        >
                            {isAuthenticated && user?.email
                                ? (user.email as string).charAt(0).toUpperCase()
                                : "+"}
                        </Avatar>
                    </IconButton>
                </Tooltip>

                <Menu
                    anchorEl={accountAnchor}
                    open={Boolean(accountAnchor)}
                    onClose={() => setAccountAnchor(null)}
                    onClick={() => setAccountAnchor(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "bottom", horizontal: "left" }}
                    disableScrollLock
                >
                    {isAuthenticated ? (
                        accountMenuItems.map((item) => (
                            <MenuItem
                                key={item.label}
                                component={Link}
                                to={item.path}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                {item.label}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem component={Link} to="/login">
                            <ListItemIcon>
                                <PersonIcon />
                            </ListItemIcon>
                            Login / Register
                        </MenuItem>
                    )}
                </Menu>
            </Box>
        );
    }

    // Mobile: AppBar + Drawer
    const drawer = (
        <Box onClick={() => setMobileOpen(false)}>
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton
                            onClick={() => navigate(item.path)}
                            selected={isActive(item.path)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
                {isAuthenticated ? (
                    accountMenuItems.map((item) => (
                        <ListItem key={item.label} disablePadding>
                            <ListItemButton onClick={() => navigate(item.path)}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    ))
                ) : (
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate("/login")}>
                            <ListItemIcon>
                                <PersonIcon />
                            </ListItemIcon>
                            <ListItemText primary="Login / Register" />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                component="header"
                color="default"
                position="static"
                sx={{ boxShadow: 4, userSelect: "none" }}
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
                            draggable={false}
                            style={{ height: 40, width: 40 }}
                        />
                        <Typography variant="h6" fontWeight={500}>
                            LucidGo
                        </Typography>
                    </Box>
                    <IconButton
                        color="inherit"
                        aria-label="open navigation"
                        onClick={() => setMobileOpen(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="temporary"
                open={mobileOpen}
                anchor="right"
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
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

export default NavSidebar;
