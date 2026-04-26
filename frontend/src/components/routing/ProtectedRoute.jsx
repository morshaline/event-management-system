import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
