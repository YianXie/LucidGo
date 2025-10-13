import { Link } from "react-router-dom";
import Flex from "./Flex";

/**
 * A reusable navigation sidebar with links
 * @param {string} title - Sidebar title
 * @param {Array} items - Array of {key, label, to} objects for navigation links
 * @param {string} activeKey - Currently active item key
 * @param {string} className - Additional CSS classes
 * @returns {JSX.Element}
 */
function NavigationSidebar({ title, items, activeKey, className = "" }) {
    return (
        <Flex
            className={`text-text-1 border-text-1 w-1/4 flex-col gap-2 overflow-auto border-r-1 border-dotted ${className}`}
        >
            <h1 className="text-text-1 border-text-1 mb-3 border-b-1 border-dotted pr-10 pb-3 pl-5 text-2xl font-[500]">
                {title}
            </h1>
            {items.map(({ key, label, to }) => (
                <Link
                    key={key}
                    to={to}
                    className={`text-text-1 hover:bg-text-1/10 mx-3 rounded-lg py-1.5 pr-3 pl-5 transition-colors duration-300 ${activeKey === key ? "bg-text-1/10" : ""}`}
                >
                    {label}
                </Link>
            ))}
        </Flex>
    );
}

export default NavigationSidebar;
