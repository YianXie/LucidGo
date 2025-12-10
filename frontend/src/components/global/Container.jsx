import Box from "@mui/material/Box";
import MuiContainer from "@mui/material/Container";

import { paddingTop } from "../../constants";

function Container({ className, children, ...props }) {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100%",
                pt: `${paddingTop}px`,
                backgroundColor: "background.default",
            }}
            className={className}
        >
            <MuiContainer maxWidth={false} {...props}>
                {children}
            </MuiContainer>
        </Box>
    );
}

export default Container;
