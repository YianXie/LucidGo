import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import { Bounce, ToastContainer } from "react-toastify";

import Header from "../layout/Header";

function Layout() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    return (
        <>
            <Header />
            <Box component="main">
                <Outlet />
            </Box>

            {/* For React Toastify */}
            <ToastContainer
                position="bottom-left"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={isDark ? "dark" : "light"}
                transition={Bounce}
            />
        </>
    );
}

export default Layout;
