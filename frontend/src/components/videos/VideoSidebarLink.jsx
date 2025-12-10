import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Link } from "react-router-dom";

function VideoSidebarLink({ className = "", to, isActive, children }) {
    return (
        <ListItem disablePadding className={className}>
            <ListItemButton
                component={Link}
                to={to}
                selected={isActive}
                sx={{
                    borderLeft: isActive ? 2 : 0,
                    borderColor: "primary.main",
                    pl: isActive ? 2.5 : 3,
                    "&.Mui-selected": {
                        backgroundColor: "action.selected",
                        "&:hover": {
                            backgroundColor: "action.selected",
                        },
                    },
                }}
            >
                <ListItemText
                    primary={children}
                    primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? "primary.main" : "text.primary",
                    }}
                />
            </ListItemButton>
        </ListItem>
    );
}

export default VideoSidebarLink;
