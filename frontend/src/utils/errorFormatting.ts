import { type AxiosError } from "axios";

/**
 * Format an error response payload into a human-readable message.
 * Handles both { detail: "..." } and { field: ["error1", ...] } shapes.
 */
export function formatErrorPayload(data: Record<string, unknown>): string {
    if ("detail" in data && data.detail !== undefined) {
        return String(data.detail);
    }
    const parts = Object.entries(data).flatMap(([key, value]) => {
        if (Array.isArray(value)) {
            return value.map((item) => `${key}: ${String(item)}`);
        }
        return [`${key}: ${String(value)}`];
    });
    return parts.join("; ") || "Request failed";
}

/**
 * Extract an error message from an Axios error response.
 * Falls back to a generic message when the response shape is unexpected.
 */
export function getErrorMessage(err: unknown): string {
    const error = err as AxiosError<Record<string, unknown>>;
    if (error.response?.data) {
        return formatErrorPayload(error.response.data);
    }
    return "An unexpected error occurred.";
}
