import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/global/Layout";
import Demo from "./pages/Demo";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="demo/" element={<Demo />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
