import { useEffect } from "react";

/**
 * Custom hook for setting the page title
 */
const usePageTitle = (title: string) => {
    useEffect(() => {
        document.title = `LucidGo - ${title}`;
    }, [title]);
};

export default usePageTitle;
