import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import DashboardPage from "./pages/DashboardPage";
import EventsPage from "./pages/EventsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}