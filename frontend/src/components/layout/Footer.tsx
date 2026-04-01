import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                marginTop: "auto",
                width: "100%",
                backgroundColor: "background.paper",
                color: "text.primary",
                boxShadow: 4,
                padding: 2,
                textAlign: "center",
                fontSize: "0.875rem",
                fontWeight: 400,
                lineHeight: "1.5",
            }}
        >
            <Typography>
                Created by Ian Xie | &copy; All rights reserved |{" "}
                <Link
                    href="https://github.com/YianXie/LucidGo"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub
                </Link>
            </Typography>
        </Box>
    );
}

export default Footer;
