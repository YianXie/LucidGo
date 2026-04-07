import { DRAWER_WIDTH } from "@/constants";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

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
            {hasContent ? (
                <Box
                    component="main"
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
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 2 }}
                    >
                        {welcomeSubtitle}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

export default SidebarLayout;
