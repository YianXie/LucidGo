import { useState } from "react";

/**
 * Custom hook for managing hover state
 * @returns {[boolean, object]} - [isHovered, hoverProps]
 */
function useHover() {
    const [isHovered, setIsHovered] = useState(false);

    const hoverProps = {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
    };

    return [isHovered, hoverProps];
}

export default useHover;
