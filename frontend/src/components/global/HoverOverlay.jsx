/**
 * A reusable overlay component that appears on hover
 * @param {boolean} isVisible - Whether the overlay is visible
 * @param {React.ReactNode} children - Content to display in the overlay
 * @returns {JSX.Element}
 */
function HoverOverlay({ isVisible, children }) {
    return (
        <div
            className={`absolute top-50/100 left-50/100 flex -translate-50/100 flex-col items-center justify-center gap-3 transition-all duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
            {children}
        </div>
    );
}

export default HoverOverlay;
