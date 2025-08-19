import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";
import Header from "./Header";
import "../../styles/components/global/Layout.module.css";

function Layout() {
    const mainRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [footerVisible, setFooterVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const height = window.scrollY + window.innerHeight;
            const scrollHeight = mainRef.current.scrollHeight;

            if (height >= scrollHeight - 0.5) {
                setFooterVisible(true);
            } else {
                setFooterVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <>
            <Header setHeaderHeight={setHeaderHeight} />
            <main ref={mainRef} style={{ paddingTop: `${headerHeight}px` }}>
                <Outlet />
            </main>
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
