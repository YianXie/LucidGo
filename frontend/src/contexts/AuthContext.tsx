import { jwtDecode } from "jwt-decode";
import {
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../api";
import type { AccessTokenPayload, TokenPair } from "../types/auth";

interface AuthContextValue {
    accessToken: string | null;
    refreshToken: string | null;
    user: Record<string, unknown> | null;
    isAuthenticated: boolean | null;
    login: (token: TokenPair) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [user, setUser] = useState<Record<string, unknown> | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
        null
    );

    const logout = useCallback(() => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    useEffect(() => {
        async function initializeAuth() {
            const storedAccess = localStorage.getItem("access");
            const storedRefresh = localStorage.getItem("refresh");
            if (storedAccess && storedRefresh) {
                if (!isTokenExpired(storedAccess)) {
                    try {
                        const payload =
                            jwtDecode<AccessTokenPayload>(storedAccess);
                        setUser(
                            (payload.user as Record<string, unknown>) ?? null
                        );
                        setAccessToken(storedAccess);
                        setRefreshToken(storedRefresh);
                        setIsAuthenticated(true);
                    } catch (error) {
                        console.error(error);
                        setIsAuthenticated(false);
                        logout();
                    }
                } else {
                    await refreshAccessToken(storedRefresh);
                }
            } else {
                setIsAuthenticated(false);
            }
        }
        initializeAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isTokenExpired = useCallback((token: string) => {
        const payload = jwtDecode<AccessTokenPayload>(token);
        return (payload.exp ?? 0) < Date.now() / 1000;
    }, []);

    const refreshAccessToken = useCallback(
        async (rt: string) => {
            try {
                const response = await api.post<{ access: string }>(
                    "/auth/token/refresh/",
                    {
                        refresh: rt,
                    }
                );
                setAccessToken(response.data.access);
                setIsAuthenticated(true);
            } catch (error) {
                console.error(error);
                setIsAuthenticated(false);
                logout();
            }
        },
        [logout]
    );

    const login = useCallback((token: TokenPair) => {
        localStorage.setItem("access", token.access);
        localStorage.setItem("refresh", token.refresh);
        setAccessToken(token.access);
        setRefreshToken(token.refresh);
        const payload = jwtDecode<AccessTokenPayload>(token.access);
        setUser((payload.user as Record<string, unknown>) ?? null);
        setIsAuthenticated(true);
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
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (ctx === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
