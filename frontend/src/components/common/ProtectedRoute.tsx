import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../../contexts/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated === null) return;

        if (!isAuthenticated) {
            navigate("/login");
            toast.error("Please login to access this page");
            return;
        }
    }, [isAuthenticated, navigate]);

    return children;
}

export default ProtectedRoute;
