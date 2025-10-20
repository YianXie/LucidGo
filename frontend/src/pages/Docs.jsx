import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Container from "../components/global/Container";
import Sidebar from "../components/docs/Sidebar";
import SidebarLink from "../components/docs/SidebarLink";
import GetStarted from "../../docs/get-started.mdx";
import Installation from "../../docs/installation.mdx";
import HowToUse from "../../docs/how-to-use.mdx";

function Docs() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("get-started");

    useEffect(() => {
        const hash = location.hash.slice(1);
        if (hash && ["get-started", "installation", "how-to-use"].includes(hash)) {
            setActiveSection(hash);
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
            default:
                return <GetStarted />;
        }
    };

    return (
        <Container className="flex">
            <Sidebar>
                <SidebarLink to={"#get-started"} isActive={activeSection === "get-started"}>
                    Get Started
                </SidebarLink>
                <SidebarLink to={"#installation"} isActive={activeSection === "installation"}>
                    Installation
                </SidebarLink>
                <SidebarLink to={"#how-to-use"} isActive={activeSection === "how-to-use"}>
                    How to Use
                </SidebarLink>
            </Sidebar>
            <div className="prose prose-invert max-w-none flex-1 p-8 overflow-y-auto">
                {renderContent()}
            </div>
        </Container>
    );
}

export default Docs;
