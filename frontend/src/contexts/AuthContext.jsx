import { jwtDecode } from "jwt-decode";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        async function initializeAuth() {
            const accessToken = localStorage.getItem("access");
            const refreshToken = localStorage.getItem("refresh");
            if (accessToken && refreshToken) {
                if (!isTokenExpired(accessToken)) {
                    try {
                        if (accessToken) {
                            const payload = jwtDecode(accessToken);
                            setUser(payload.user);
                            setAccessToken(accessToken);
                            setRefreshToken(refreshToken);
                            setIsAuthenticated(true);
                        } else {
                            console.log("refreshing access token");
                            await refreshAccessToken();
                        }
                    } catch (error) {
                        console.error(error);
                        setIsAuthenticated(false);
                        logout();
                    }
                } else {
                    await refreshAccessToken(refreshToken);
                }
            } else {
                setIsAuthenticated(false);
            }
        }
        initializeAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isTokenExpired = useCallback((token) => {
        const payload = jwtDecode(token);
        return payload.exp < Date.now() / 1000;
    }, []);

    const refreshAccessToken = useCallback(
        async (refreshToken) => {
            try {
                const response = await api.post("/api/token/refresh/", {
                    refresh: refreshToken,
                });
                setAccessToken(response.data.access);
                setIsAuthenticated(true);
            } catch (error) {
                console.error(error);
                setIsAuthenticated(false);
                logout();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [refreshToken]
    );

    const login = useCallback((token) => {
        localStorage.setItem("access", token.access);
        localStorage.setItem("refresh", token.refresh);
        setAccessToken(token.access);
        setRefreshToken(token.refresh);
        const payload = jwtDecode(token.access);
        setUser(payload.user);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                refreshToken,
                user,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    return useContext(AuthContext);
};
