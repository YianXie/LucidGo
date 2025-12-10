import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

function VideoSidebar({ className = "", children }) {
    return (
        <Paper
            elevation={0}
            sx={{
                position: "sticky",
                top: 0,
                height: "100vh",
                width: 256,
                flexShrink: 0,
                borderRight: 1,
                borderColor: "divider",
                p: 3,
                backgroundColor: "background.paper",
            }}
            className={className}
        >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Video Blog
            </Typography>
            <List component="nav" sx={{ p: 0 }}>
                {children}
            </List>
        </Paper>
    );
}

export default VideoSidebar;
