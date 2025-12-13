import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import ThemeWrapper from "./components/global/ThemeWrapper.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ThemeWrapper>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ThemeWrapper>
    </StrictMode>
);
