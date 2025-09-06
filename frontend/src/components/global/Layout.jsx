import { Outlet } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";
import Header from "./Header";

function Layout() {
    return (
        <>
            <Header />
            <main className="h-full w-full">
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
