import type { JwtPayload } from "jwt-decode";

export interface AccessTokenPayload extends JwtPayload {
    user?: Record<string, unknown>;
}

export interface TokenPair {
    access: string;
    refresh: string;
}
