import api from "@/api";
import { DEFAULT_ANALYSIS_CONFIG } from "@/constants";
import type { AccessTokenPayload, TokenPair } from "@/types/auth";
import type { AnalysisConfig } from "@/types/game";
import { jwtDecode } from "jwt-decode";
import {
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

interface AuthContextValue {
    accessToken: string | null;
    refreshToken: string | null;
    user: Record<string, unknown> | null;
    isAuthenticated: boolean | null;
    defaultAnalysisConfig: AnalysisConfig;
    login: (token: TokenPair) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isTokenExpired(token: string): boolean {
    const payload = jwtDecode<AccessTokenPayload>(token);
    return (payload.exp ?? 0) < Date.now() / 1000;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [user, setUser] = useState<Record<string, unknown> | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
        null
    );
    const [defaultAnalysisConfig, setDefaultAnalysisConfig] =
        useState<AnalysisConfig>(DEFAULT_ANALYSIS_CONFIG);

    const logout = useCallback(() => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setDefaultAnalysisConfig(DEFAULT_ANALYSIS_CONFIG);
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

                        const config = await fetchDefaultAnalysisConfig();
                        setDefaultAnalysisConfig(config);
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

    const refreshAccessToken = useCallback(
        async (rt: string) => {
            try {
                const response = await api.post<{ access: string }>(
                    "/auth/token/refresh/",
                    {
                        refresh: rt,
                    }
                );
                const newAccess = response.data.access;
                setAccessToken(newAccess);
                try {
                    const payload = jwtDecode<AccessTokenPayload>(newAccess);
                    setUser((payload.user as Record<string, unknown>) ?? null);
                } catch {
                    setUser(null);
                }
                setIsAuthenticated(true);
            } catch (error) {
                console.error(error);
                setIsAuthenticated(false);
                logout();
            }
        },
        [logout]
    );

    const fetchDefaultAnalysisConfig =
        useCallback(async (): Promise<AnalysisConfig> => {
            try {
                const response = await api.get<{
                    analysis_config: AnalysisConfig;
                }>("/auth/user/analysis-config/");
                if (!response.data || !response.data.analysis_config) {
                    throw new Error("Invalid response from server");
                }
                return response.data.analysis_config;
            } catch (error) {
                console.error(error);
                throw error;
            }
        }, []);

    const login = useCallback(async (token: TokenPair) => {
        localStorage.setItem("access", token.access);
        localStorage.setItem("refresh", token.refresh);
        setAccessToken(token.access);
        setRefreshToken(token.refresh);

        const payload = jwtDecode<AccessTokenPayload>(token.access);
        setUser((payload.user as Record<string, unknown>) ?? null);
        setIsAuthenticated(true);

        const config = await fetchDefaultAnalysisConfig();
        setDefaultAnalysisConfig(config);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                refreshToken,
                user,
                isAuthenticated,
                defaultAnalysisConfig,
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
