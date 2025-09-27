import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/global/Layout";
import Home from "./pages/Home";
import Demo from "./pages/Demo";
import Docs from "./pages/Docs";
import VideoBlog from "./pages/VideoBlog";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="demo/" element={<Demo />} />
                    <Route path="docs/" element={<Docs />} />
                    <Route path="video-blog/" element={<VideoBlog />} />
                    <Route path="video-blog/:videoId" element={<VideoBlog />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
