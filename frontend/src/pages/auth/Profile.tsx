import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import usePageTitle from "../../hooks/usePageTitle";

function Profile() {
    usePageTitle("Profile");

    return (
        <Container>
            <Typography variant="h1">Profile</Typography>
        </Container>
    );
}

export default Profile;
