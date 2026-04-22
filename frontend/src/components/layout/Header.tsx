import FeedbackIcon from "@mui/icons-material/Feedback";
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
import Slide from "@mui/material/Slide";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { type ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import logo from "/logo.png";

function HideOnScroll({ children }: { children: ReactElement }) {
    const trigger = useScrollTrigger({
        target: typeof window !== "undefined" ? window : undefined,
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
    const { isAuthenticated, user } = useAuth();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        document.addEventListener("scroll", handleClose);

        return () => {
            document.removeEventListener("scroll", handleClose);
        };
    }, []);

    const handleAccount = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const navItems = [
        { label: "Docs", path: "/docs" },
        { label: "Demo", path: "/demo" },
    ];

    const accountMenuItems = [
        {
            label: "Profile",
            icon: <PersonIcon />,
            path: "/profile",
        },
        {
            label: "Settings",
            icon: <SettingsIcon />,
            path: "/settings",
        },
        {
            label: "Feedback Form",
            icon: <FeedbackIcon />,
            path: "https://forms.gle/UUfoY7uhRBXSqvux8",
        },
        {
            label: "Logout",
            icon: <LogoutIcon />,
            path: "/logout",
        },
    ];

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
            <List>
                {[...navItems, ...accountMenuItems].map((item) => (
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
            </List>
        </Box>
    );

    const accountMenu = (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            slotProps={{
                paper: {
                    elevation: 0,
                    sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        mt: 1.5,
                        "& .MuiAvatar-root": {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        "&::before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: "background.paper",
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                        },
                    },
                },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            disableScrollLock
        >
            {accountMenuItems.map((item) => (
                <MenuItem
                    key={item.label}
                    component={Link}
                    to={item.path}
                    onClick={handleClose}
                >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    {item.label}
                </MenuItem>
            ))}
        </Menu>
    );

    return (
        <>
            <HideOnScroll>
                <AppBar
                    component="header"
                    color="default"
                    sx={{
                        position: "sticky",
                        top: 0,
                        width: "100%",
                        userSelect: "none",
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
                                draggable={false}
                                style={{
                                    height: 40,
                                    width: 40,
                                }}
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
                                    gap: 4,
                                }}
                            >
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className="no-underline transition-all hover:opacity-80 hover:underline"
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                                {isAuthenticated ? (
                                    <Tooltip title="Account">
                                        <IconButton
                                            onClick={handleAccount}
                                            size="small"
                                            aria-controls={
                                                open
                                                    ? "account-menu"
                                                    : undefined
                                            }
                                            aria-haspopup="true"
                                            aria-expanded={
                                                open ? "true" : undefined
                                            }
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                }}
                                            >
                                                {(user?.email as string)
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </Avatar>
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                    <Tooltip title="Login/Register">
                                        <IconButton
                                            onClick={() => navigate("/login")}
                                            size="small"
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                }}
                                            >
                                                +
                                            </Avatar>
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        )}
                    </Toolbar>
                    {accountMenu}
                </AppBar>
            </HideOnScroll>
            <Drawer
                variant="temporary"
                open={mobileOpen}
                anchor="right"
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
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
