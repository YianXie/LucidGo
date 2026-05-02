import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

import { DRAWER_WIDTH } from "../../constants";

const Sidebar = ({
    children,
    title = "Documentation",
}: {
    children: ReactNode;
    title?: string;
}) => {
    return (
        <Paper
            elevation={0}
            sx={{
                position: "sticky",
                top: 0,
                height: "100vh",
                width: DRAWER_WIDTH,
                flexShrink: 0,
                borderRight: 1,
                borderColor: "divider",
                p: 3,
                backgroundColor: "background.paper",
            }}
        >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                {title}
            </Typography>
            <List component="nav" sx={{ p: 0 }}>
                {children}
            </List>
        </Paper>
    );
};

export default Sidebar;
