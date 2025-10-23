import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./stores";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/features/auth/ProtectedRoute";
import AdminRoute from "./components/features/auth/AdminRoute";

function App() {
    return (
        <Provider store={store}>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<HomePage />} />
                            <Route
                                path="profile/:userId?"
                                element={<ProfilePage />}
                            />
                            <Route
                                path="admin"
                                element={
                                    <AdminRoute>
                                        <AdminPanel />
                                    </AdminRoute>
                                }
                            />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </Provider>
    );
}

export default App;
