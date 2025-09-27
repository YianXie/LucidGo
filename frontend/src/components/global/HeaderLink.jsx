import { Link, useLocation } from "react-router-dom";

function HeaderLink({ to, children }) {
    const location = useLocation();

    return (
        <li
            className={`after:bg-text-1 relative py-5 font-[500] transition-all duration-300 after:absolute after:top-50/100 after:bottom-0 after:left-0 after:mt-3.5 after:h-0.5 after:w-full after:-translate-y-50/100 after:opacity-0 after:transition-all after:duration-300 hover:-translate-y-0.5 hover:opacity-80 hover:after:opacity-100 ${location.pathname === to ? "after:opacity-100" : ""}`}
        >
            <Link to={to} className={`text-md py-5`}>
                {children}
            </Link>
        </li>
    );
}

export default HeaderLink;
