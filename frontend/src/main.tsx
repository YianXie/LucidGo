import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto/700.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import ThemeWrapper from "./components/common/ThemeWrapper";
import { AuthProvider } from "./contexts/AuthContext";

const rootEl = document.getElementById("root");
if (!rootEl) {
    throw new Error('Root element with id "root" not found');
}

createRoot(rootEl).render(
    <StrictMode>
        <ThemeWrapper>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ThemeWrapper>
    </StrictMode>
);
