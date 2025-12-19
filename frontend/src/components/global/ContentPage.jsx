import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useRef } from "react";
import { useLocation, useParams } from "react-router-dom";

import { drawerWidth } from "../../constants";
import usePageTitle from "../../hooks/usePageTitle";
import Sidebar from "./Sidebar";
import SidebarLink from "./SidebarLink";

function ContentPage({
    items,
    basePath,
    pageTitle,
    welcomeTitle,
    welcomeMessage,
    sidebarTitle = "Documentation",
}) {
    usePageTitle(pageTitle);

    const { id } = useParams();
    const location = useLocation();
    const contentRef = useRef(null);

    const sidebarContent = (
        <Sidebar title={sidebarTitle}>
            {items.map((item) => (
                <SidebarLink
                    key={item.id}
                    to={`${basePath}/${item.id}`}
                    isActive={location.pathname === `${basePath}/${item.id}`}
                >
                    {item.title}
                </SidebarLink>
            ))}
        </Sidebar>
    );

    const renderContent = () => {
        const Content = items.find((item) => item.id === id)?.content;
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
                            {welcomeTitle}
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mt: 2 }}
                        >
                            {welcomeMessage}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Container>
    );
}

export default ContentPage;
