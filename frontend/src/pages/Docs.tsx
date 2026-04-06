import Box from "@mui/material/Box";
import { type FC } from "react";
import { useLocation, useParams } from "react-router-dom";

import getStarted from "../../../docs/get-started.md";
import githubAction from "../../../docs/github-action.md";
import howToUse from "../../../docs/how-to-use.md";
import installation from "../../../docs/installation.md";
import Sidebar from "../components/common/Sidebar";
import SidebarLink from "../components/common/SidebarLink";
import SidebarLayout from "../components/layout/SidebarLayout";

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

    const Content = docs.find((doc) => doc.id === id)?.content;

    return (
        <SidebarLayout
            sidebar={sidebarContent}
            hasContent={!!Content}
            welcomeTitle="Welcome to the documentation page"
            welcomeSubtitle="Click on a documentation to read it."
            contentSx={{
                p: 3,
                "& .prose": { maxWidth: "none" },
            }}
        >
            {Content && (
                <Box className="prose prose-invert">
                    <Content />
                </Box>
            )}
        </SidebarLayout>
    );
}

export default Docs;
