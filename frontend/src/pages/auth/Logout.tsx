import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../../contexts/AuthContext";

function Logout() {
    const { logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated === null) return;
        if (isAuthenticated === false) {
            navigate("/login");
            toast.error("Please login to logout");
            return;
        }
        logout();
        toast.success("Logout successful");
        navigate("/login");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    return null;
}

export default Logout;
