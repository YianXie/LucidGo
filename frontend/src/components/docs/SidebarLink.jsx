import { Link } from "react-router-dom";

function SidebarLink({ className = "", to, isActive, children }) {
    const activeClass = isActive
        ? "text-blue-500 font-semibold border-l-2 border-blue-500 pl-3"
        : "text-text-1 pl-3.5";

    return (
        <Link
            to={to}
            className={`${activeClass} cursor-pointer transition-all duration-300 hover:pl-4 hover:text-blue-400 ${className}`}
        >
            {children}
        </Link>
    );
}

export default SidebarLink;
