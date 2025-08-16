import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/global/Layout";
import Home from "./pages/Home";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
