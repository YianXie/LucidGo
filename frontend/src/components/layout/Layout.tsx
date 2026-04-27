import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import { Bounce, ToastContainer } from "react-toastify";

import Footer from "./Footer";
import NavSidebar from "./NavSidebar";

function Layout() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                height: "100vh",
                overflow: "hidden",
            }}
        >
            <NavSidebar />
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    overflow: "hidden",
                }}
            >
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        overflowX: "auto",
                        overflowY: "auto",
                    }}
                >
                    <Outlet />
                </Box>
                <Footer />
            </Box>

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
        </Box>
    );
}

export default Layout;
