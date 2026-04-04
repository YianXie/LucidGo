import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import usePageTitle from "../hooks/usePageTitle";

function Settings() {
    usePageTitle("Settings");

    return (
        <Container>
            <Typography variant="h1">Settings</Typography>
            <Typography variant="body1">
                This is the settings page. Here you can change your settings.
            </Typography>
        </Container>
    );
}

export default Settings;
