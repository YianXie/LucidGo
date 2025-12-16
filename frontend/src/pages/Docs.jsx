import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import GetStarted from "../../../docs/get-started.md";
import HowToUse from "../../../docs/how-to-use.md";
import Installation from "../../../docs/installation.md";
import Sidebar from "../components/global/Sidebar";
import SidebarLink from "../components/global/SidebarLink";
import { drawerWidth } from "../constants";
import usePageTitle from "../hooks/usePageTitle";

function Docs() {
    usePageTitle("Docs");

    const location = useLocation();
    const navigate = useNavigate();
    const contentRef = useRef(null);
    const [activeSection, setActiveSection] = useState("get-started");

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

    const renderContent = () => {
        switch (activeSection) {
            case "installation":
                return <Installation />;
            case "how-to-use":
                return <HowToUse />;
            case "get-started":
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
        <Container maxWidth="xl">
            <Box sx={{ display: "flex" }}>
                <Box
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                    }}
                >
                    {sidebarContent}
                </Box>
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
