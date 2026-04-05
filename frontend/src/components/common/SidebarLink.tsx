import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

function SidebarLink({
    children,
    to,
    isActive,
}: {
    children: ReactNode;
    to: string;
    isActive: boolean;
}) {
    return (
        <ListItem disablePadding>
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
                    slotProps={{
                        primary: {
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? "primary.main" : "text.primary",
                        },
                    }}
                />
            </ListItemButton>
        </ListItem>
    );
}

export default SidebarLink;
