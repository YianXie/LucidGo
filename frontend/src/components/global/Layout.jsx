import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import styles from "../../styles/Layout.module.css";

function Layout() {
    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
}

export default Layout;
