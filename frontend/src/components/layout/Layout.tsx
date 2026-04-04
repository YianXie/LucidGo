import Container from "@mui/material/Container";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import { Bounce, ToastContainer } from "react-toastify";

import Footer from "./Footer";
import Header from "./Header";

function Layout() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    return (
        <>
            <Header />
            <Container
                maxWidth="lg"
                component="main"
                sx={{ minHeight: "100vh" }}
            >
                <Outlet />
            </Container>
            <Footer />

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
