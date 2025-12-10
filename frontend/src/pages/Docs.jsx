import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import GetStarted from "../../docs/get-started.mdx";
import HowToUse from "../../docs/how-to-use.mdx";
import Installation from "../../docs/installation.mdx";
import Sidebar from "../components/docs/Sidebar";
import SidebarLink from "../components/docs/SidebarLink";
import Container from "../components/global/Container";

const drawerWidth = 256;

function Docs() {
    const location = useLocation();
    const navigate = useNavigate();
    const contentRef = useRef(null);
    const [activeSection, setActiveSection] = useState("get-started");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const hash = location.hash.slice(1);
        if (
            hash &&
            ["get-started", "installation", "how-to-use"].includes(hash)
        ) {
            setActiveSection(hash);
            // Scroll to top when section changes
            if (contentRef.current) {
                contentRef.current.scrollTop = 0;
            }
        } else if (!location.hash) {
            navigate("#get-started", { replace: true });
        }
    }, [location.hash, navigate]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const renderContent = () => {
        switch (activeSection) {
            case "installation":
                return <Installation />;
            case "how-to-use":
                return <HowToUse />;
            case "get-started":
            default:
                return <GetStarted />;
        }
    };

    const sidebarContent = (
        <Sidebar>
            <SidebarLink
                to={"#get-started"}
                isActive={activeSection === "get-started"}
            >
                Get Started
            </SidebarLink>
            <SidebarLink
                to={"#installation"}
                isActive={activeSection === "installation"}
            >
                Installation
            </SidebarLink>
            <SidebarLink
                to={"#how-to-use"}
                isActive={activeSection === "how-to-use"}
            >
                How to Use
            </SidebarLink>
        </Sidebar>
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
                    ref={contentRef}
                    component="main"
                    sx={{
                        flexGrow: 1,
                        overflowY: "auto",
                        p: 3,
                        "& .prose": {
                            maxWidth: "none",
                        },
                    }}
                    className="prose prose-invert"
                >
                    {renderContent()}
                </Box>
            </Box>
        </Container>
    );
}

export default Docs;
