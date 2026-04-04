import AppBar from "@mui/material/AppBar";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

function Footer() {
    return (
        <AppBar
            component="footer"
            color="default"
            sx={{
                position: "relative",
                marginTop: "auto",
                width: "100%",
                boxShadow: 4,
                padding: 2,
                userSelect: "none",
                textAlign: "center",
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
        </AppBar>
    );
}

export default Footer;
