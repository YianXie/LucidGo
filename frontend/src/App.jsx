import { BrowserRouter, Route, Routes } from "react-router-dom";

import Layout from "./components/layout/Layout";
import Demo from "./pages/Demo";
import Docs from "./pages/Docs";
import Home from "./pages/Home";
import NotFoundPage from "./pages/NotFoundPage";
import Login from "./pages/auth/Login";
import Logout from "./pages/auth/Logout";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="demo/" element={<Demo />} />
                    <Route path="docs/" element={<Docs />} />
                    <Route path="login/" element={<Login />} />
                    <Route path="logout/" element={<Logout />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
