import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Analyze from "./pages/Analyze";
import Demo from "./pages/Demo";
import Docs from "./pages/Docs";
import Home from "./pages/Home";
import NotFoundPage from "./pages/NotFoundPage";
import Settings from "./pages/Settings";
import Login from "./pages/auth/Login";
import Logout from "./pages/auth/Logout";
import Profile from "./pages/auth/Profile";
import Register from "./pages/auth/Register";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="demo/" element={<Demo />} />
                    <Route path="analyze/" element={<Analyze />} />
                    <Route path="docs/" element={<Docs />} />
                    <Route path="docs/:id/" element={<Docs />} />
                    <Route
                        path="profile/"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="settings/"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="settings/:id/"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="login/" element={<Login />} />
                    <Route path="register/" element={<Register />} />
                    <Route path="logout/" element={<Logout />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;
