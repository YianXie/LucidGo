import { useEffect } from "react";

/**
 * Custom hook for setting the page title
 * @param {string} title - The title to set
 */
function usePageTitle(title) {
    useEffect(() => {
        document.title = `LucidGo - ${title}`;
    }, [title]);
}

export default usePageTitle;
