/**
 * A reusable clickable icon component
 * @param {string} iconClass - Bootstrap icon class name
 * @param {function} onClick - Click handler
 * @param {string} title - Tooltip title
 * @param {string} className - Additional CSS classes
 * @returns {JSX.Element}
 */
function ClickableIcon({ iconClass, onClick, title, className = "" }) {
    return (
        <i
            className={`${iconClass} cursor-pointer transition-all hover:opacity-80 ${className}`}
            title={title}
            onClick={onClick}
        ></i>
    );
}

export default ClickableIcon;
