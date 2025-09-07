import { Link } from "react-router-dom";

function SidebarLink({ className, to, children }) {
    return (
        <Link
            to={to}
            className={`text-text-1 cursor-pointer transition-colors duration-300 hover:text-blue-500`}
        >
            {children}
        </Link>
    );
}

export default SidebarLink;
