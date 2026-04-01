import { useNavigate } from "react-router-dom";

/**
 * Custom hook for navigation actions
 */
function useNavigation() {
    const navigate = useNavigate();

    return {
        navigateTo: (path: string) => () => navigate(path),
        openExternal: (url: string) => () => window.open(url),
        openInNewTab: (path: string) => () => window.open(path),
    };
}

export default useNavigation;
