import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Redirects the user to the home page if they are already authenticated.
 */
const useRedirectIfAuthenticated = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);
};

export default useRedirectIfAuthenticated;
