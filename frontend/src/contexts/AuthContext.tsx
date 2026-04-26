import api from "@/api";
import { DEFAULT_USER_SETTINGS, USER_SETTINGS_URL } from "@/constants";
import type { AccessTokenPayload, TokenPair } from "@/types/auth";
import type { UserSettings } from "@/types/game";
import { getErrorMessage } from "@/utils/errorFormatting";
import { jwtDecode } from "jwt-decode";
import {
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { toast } from "react-toastify";

interface AuthContextValue {
    accessToken: string | null;
    refreshToken: string | null;
    user: Record<string, unknown> | null;
    isAuthenticated: boolean | null;
    userSettings: UserSettings;
    setUserSettings: (settings: UserSettings) => void;
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
    const [userSettings, setUserSettings] = useState<UserSettings>(
        DEFAULT_USER_SETTINGS
    );

    const logout = useCallback(() => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setUserSettings(DEFAULT_USER_SETTINGS);
    }, []);

    const fetchUserSettings = useCallback(async (): Promise<UserSettings> => {
        try {
            const { data } = await api.get<UserSettings>(USER_SETTINGS_URL);
            if (!data) throw new Error("Invalid response from server");
            return data;
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error));
            throw error;
        }
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
                localStorage.setItem("access", newAccess);
                setAccessToken(newAccess);
                try {
                    const payload = jwtDecode<AccessTokenPayload>(newAccess);
                    setUser((payload.user as Record<string, unknown>) ?? null);
                } catch {
                    setUser(null);
                }
                setIsAuthenticated(true);

                try {
                    const userSettings = await fetchUserSettings();
                    setUserSettings(userSettings);
                } catch (error) {
                    console.error(error);
                    toast.error(
                        "Failed to fetch user settings, using default settings."
                    );
                    setUserSettings(DEFAULT_USER_SETTINGS);
                }
            } catch (error) {
                console.error(error);
                setIsAuthenticated(false);
                logout();
            }
        },
        [fetchUserSettings, logout]
    );

    useEffect(() => {
        async function initializeAuth() {
            const storedAccess = localStorage.getItem("access");
            const storedRefresh = localStorage.getItem("refresh");
            if (storedAccess && storedRefresh) {
                if (!isTokenExpired(storedAccess)) {
                    try {
                        const payload =
                            jwtDecode<AccessTokenPayload>(storedAccess);
                        const userSettings = await fetchUserSettings();
                        setUser(
                            (payload.user as Record<string, unknown>) ?? null
                        );
                        setAccessToken(storedAccess);
                        setRefreshToken(storedRefresh);
                        setIsAuthenticated(true);
                        setUserSettings(userSettings);
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
        void initializeAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = useCallback(
        async (token: TokenPair) => {
            localStorage.setItem("access", token.access);
            localStorage.setItem("refresh", token.refresh);
            setAccessToken(token.access);
            setRefreshToken(token.refresh);

            const payload = jwtDecode<AccessTokenPayload>(token.access);
            setUser((payload.user as Record<string, unknown>) ?? null);
            setIsAuthenticated(true);

            try {
                const settings = await fetchUserSettings();
                setUserSettings(settings);
            } catch (error) {
                console.error(error);
                toast.error(
                    "Failed to fetch analysis configuration, using default settings."
                );
                setUserSettings(DEFAULT_USER_SETTINGS);
            }
        },
        [fetchUserSettings]
    );

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                refreshToken,
                user,
                isAuthenticated,
                userSettings,
                setUserSettings,
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
    if (ctx === undefined)
        throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
