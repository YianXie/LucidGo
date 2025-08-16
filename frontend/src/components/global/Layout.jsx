import { Outlet } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";
import Header from "./Header";
import Footer from "./Footer";
import styles from "../../styles/Layout.module.css";

function Layout() {
    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
        </>
    );
}

export default Layout;
