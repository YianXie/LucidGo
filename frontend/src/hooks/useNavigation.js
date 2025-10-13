import { useNavigate } from "react-router-dom";

/**
 * Custom hook for navigation actions
 * @returns {object} - Navigation helper functions
 */
function useNavigation() {
    const navigate = useNavigate();

    return {
        navigateTo: (path) => () => navigate(path),
        openExternal: (url) => () => window.open(url),
        openInNewTab: (path) => () => window.open(path),
    };
}

export default useNavigation;
