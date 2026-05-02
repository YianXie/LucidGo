import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { useLocation, useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import getStarted from "../../../docs/get-started.md";
import githubAction from "../../../docs/github-action.md";
import howToUse from "../../../docs/how-to-use.md";
import installation from "../../../docs/installation.md";
import Sidebar from "../components/common/Sidebar";
import SidebarLink from "../components/common/SidebarLink";
import SidebarLayout from "../components/layout/SidebarLayout";

const rawDocs: string[] = [
    getStarted.toString(),
    githubAction.toString(),
    howToUse.toString(),
    installation.toString(),
];

const Docs = () => {
    const { id } = useParams();
    const location = useLocation();
    const [docs, setDocs] = useState<
        { id: string; title: string; content: string }[]
    >([]);

    useEffect(() => {
        Promise.all(
            rawDocs.map((doc) =>
                fetch(doc)
                    .then((response) => response.text())
                    .then((text) => ({
                        id: doc.split("/").pop()?.split(".")[0] ?? "",
                        title: doc.split("/").pop()?.split(".")[0] ?? "",
                        content: text,
                    }))
            )
        ).then(setDocs);
    }, []);

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

    const content = docs.find((doc) => doc.id === id)?.content;

    return (
        <SidebarLayout
            sidebar={sidebarContent}
            hasContent={!!content}
            welcomeTitle="Welcome to the documentation page"
            welcomeSubtitle="Click on a documentation to read it."
            contentSx={{
                p: 3,
                "& .prose": { maxWidth: "none" },
            }}
        >
            <Box className="prose prose-invert">
                {content && (
                    <Markdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            pre({ children }) {
                                return <>{children}</>;
                            },
                            code({ className, children }) {
                                const match = /language-(\w+)/.exec(
                                    className || ""
                                );
                                return match ? (
                                    <SyntaxHighlighter
                                        language={match[1]}
                                        style={vscDarkPlus}
                                    >
                                        {String(children)}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code className={className}>
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {content}
                    </Markdown>
                )}
            </Box>
        </SidebarLayout>
    );
};

export default Docs;
