import { type ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated === false) {
            toast.error("Please login to access this page");
        }
    }, [isAuthenticated]);

    if (isAuthenticated === null) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login/" replace />;
    }

    return children;
};

export default ProtectedRoute;
