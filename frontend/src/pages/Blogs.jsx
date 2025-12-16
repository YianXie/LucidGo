import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useRef } from "react";
import { useLocation, useParams } from "react-router-dom";

import BlogPageIsHere from "../../../articles/blog-page-is-here.md";
import MiniKataGoInProgress from "../../../articles/mini-katago-in-progress.md";
import Sidebar from "../components/global/Sidebar";
import SidebarLink from "../components/global/SidebarLink";
import { drawerWidth } from "../constants";
import usePageTitle from "../hooks/usePageTitle";

function Blogs() {
    usePageTitle("Blogs");

    const { id } = useParams();
    const location = useLocation();
    const contentRef = useRef(null);
    const articles = [
        {
            id: "blog-page-is-here",
            title: "Blog Page is Here!",
            content: BlogPageIsHere,
        },
        {
            id: "mini-katago-in-progress",
            title: "Mini KataGo is Work in Progress!",
            content: MiniKataGoInProgress,
        },
    ];

    const sidebarContent = (
        <Sidebar>
            {articles.map((article) => (
                <SidebarLink
                    key={article.id}
                    to={`/blogs/${article.id}`}
                    isActive={location.pathname === `/blogs/${article.id}`}
                >
                    {article.title}
                </SidebarLink>
            ))}
        </Sidebar>
    );

    const renderContent = () => {
        const Content = articles.find((article) => article.id === id)?.content;
        return (
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
                <Content />
            </Box>
        );
    };

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
                {id ? (
                    renderContent()
                ) : (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h4" fontWeight={500}>
                            Welcome to the blog page
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mt: 2 }}
                        >
                            Click on a blog to read it.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Container>
    );
}

export default Blogs;
