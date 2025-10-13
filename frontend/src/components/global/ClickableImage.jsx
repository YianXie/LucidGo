/**
 * A reusable clickable image component with hover effects
 * @param {string} src - Image source
 * @param {string} alt - Image alt text
 * @param {function} onClick - Click handler
 * @param {boolean} isHovered - Whether the image is hovered
 * @param {object} hoverProps - Props for hover handlers (onMouseEnter, onMouseLeave)
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Optional children (like overlay content)
 * @returns {JSX.Element}
 */
function ClickableImage({
    src,
    alt,
    onClick,
    isHovered,
    hoverProps,
    className = "",
    children,
}) {
    return (
        <div
            className="relative h-max w-max cursor-pointer"
            onClick={onClick}
            {...hoverProps}
        >
            <img
                src={src}
                alt={alt}
                draggable={false}
                className={`transition-all duration-300 ${isHovered ? "blur-xs brightness-50" : ""} ${className}`}
            />
            {children}
        </div>
    );
}

export default ClickableImage;
