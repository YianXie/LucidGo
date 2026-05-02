import { useState } from "react";

/**
 * Custom hook for managing hover state
 */
const useHover = (): [
    boolean,
    { onMouseEnter: () => void; onMouseLeave: () => void },
] => {
    const [isHovered, setIsHovered] = useState(false);

    const hoverProps = {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
    };

    return [isHovered, hoverProps];
};

export default useHover;
