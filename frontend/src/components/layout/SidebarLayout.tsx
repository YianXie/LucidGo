import { DRAWER_WIDTH } from "@/constants";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState } from "react";

function SidebarLayout({
    sidebar,
    hasContent,
    welcomeTitle,
    welcomeSubtitle,
    contentSx,
    children,
}: {
    sidebar: React.ReactNode;
    hasContent: boolean;
    welcomeTitle: string;
    welcomeSubtitle: string;
    contentSx?: SxProps<Theme>;
    children?: React.ReactNode;
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [drawerOpen, setDrawerOpen] = useState(false);

    const mainContent = hasContent ? (
        <Box
            sx={[
                {
                    flexGrow: 1,
                    minWidth: 0,
                    overflowY: "auto",
                    px: 3,
                },
                ...(Array.isArray(contentSx)
                    ? contentSx
                    : contentSx
                      ? [contentSx]
                      : []),
            ]}
        >
            {children}
        </Box>
    ) : (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" fontWeight={500}>
                {welcomeTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                {welcomeSubtitle}
            </Typography>
        </Box>
    );

    if (isMobile) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", py: 2 }}>
                <Box sx={{ px: 2, pb: 1 }}>
                    <IconButton
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Open navigation"
                        size="small"
                        sx={{
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                        }}
                    >
                        <MenuIcon fontSize="small" />
                    </IconButton>
                </Box>
                <Drawer
                    variant="temporary"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    onClick={() => setDrawerOpen(false)}
                    sx={{
                        "& .MuiDrawer-paper": {
                            width: DRAWER_WIDTH,
                            boxSizing: "border-box",
                        },
                    }}
                >
                    {sidebar}
                </Drawer>
                {mainContent}
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", py: 4 }}>
            <Box
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                }}
            >
                {sidebar}
            </Box>
            {mainContent}
        </Box>
    );
}

export default SidebarLayout;
