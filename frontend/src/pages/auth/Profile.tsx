import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import usePageTitle from "../../hooks/usePageTitle";

function Profile() {
    usePageTitle("Profile");

    return (
        <Box>
            <Typography variant="h1">Profile</Typography>
        </Box>
    );
}

export default Profile;
