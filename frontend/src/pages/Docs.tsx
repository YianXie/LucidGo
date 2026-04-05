import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { type FC } from "react";
import { useLocation, useParams } from "react-router-dom";

import getStarted from "../../../docs/get-started.md";
import githubAction from "../../../docs/github-action.md";
import howToUse from "../../../docs/how-to-use.md";
import installation from "../../../docs/installation.md";
import Sidebar from "../components/common/Sidebar";
import SidebarLink from "../components/common/SidebarLink";
import { drawerWidth } from "../constants";

const docs: { id: string; title: string; content: FC }[] = [
    {
        id: "get-started",
        title: "Get Started",
        content: getStarted,
    },
    {
        id: "github-action",
        title: "GitHub Action",
        content: githubAction,
    },
    {
        id: "how-to-use",
        title: "How to Use",
        content: howToUse,
    },
    {
        id: "installation",
        title: "Installation",
        content: installation,
    },
];

function Docs() {
    const { id } = useParams();
    const location = useLocation();

    const sidebarContent = (
        <Sidebar title="Documentation">
            {docs.map((doc) => (
                <SidebarLink
                    key={doc.id}
                    to={`/docs/${doc.id}`}
                    isActive={location.pathname === `/docs/${doc.id}`}
                >
                    {doc.title}
                </SidebarLink>
            ))}
        </Sidebar>
    );

    function renderContent() {
        const Content = docs.find((doc) => doc.id === id)?.content;
        if (!Content) return null;

        return (
            <Box
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
                <Content />
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex" }}>
            <Box
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                }}
            >
                {sidebarContent}
            </Box>
            {id ? (
                renderContent()
            ) : (
                <Box sx={{ p: 3 }}>
                    <Typography variant="h4" fontWeight={500}>
                        Welcome to the documentation page
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 2 }}
                    >
                        Click on a documentation to read it.
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

export default Docs;
