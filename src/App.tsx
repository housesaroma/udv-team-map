// App.tsx
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPanel from "./pages/AdminPanel";
import TreeEditorPage from "./pages/TreeEditorPage";
import AboutPage from "./pages/AboutPage";
import ProtectedRoute from "./components/features/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { ROUTES, toRelativePath } from "./constants/routes";

function App() {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path={ROUTES.login} element={<LoginPage />} />

      {/* Защищенные маршруты */}
      <Route
        path={ROUTES.root}
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route
          path={toRelativePath(ROUTES.department.param)}
          element={<HomePage />}
        />
        <Route
          path={toRelativePath(ROUTES.profile.param)}
          element={<ProfilePage />}
        />
        <Route path={toRelativePath(ROUTES.admin)} element={<AdminPanel />} />
        <Route
          path={toRelativePath(ROUTES.treeEditor)}
          element={<TreeEditorPage />}
        />
        <Route path={toRelativePath(ROUTES.about)} element={<AboutPage />} />
      </Route>

      {/* Обработка несуществующих маршрутов */}
      <Route path={ROUTES.notFound} element={<NotFound />} />
    </Routes>
  );
}

export default App;
