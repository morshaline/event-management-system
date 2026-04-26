import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthForm from "../components/auth/AuthForm";
import { useAuth } from "../hooks/useAuth";
import SectionHeader from "../components/common/SectionHeader";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authBusy } = useAuth();

  const redirectPath = location.state?.from || "/dashboard";

  const handleLogin = async (credentials) => {
    await login(credentials);
    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="page narrow-page">
      <SectionHeader
        eyebrow="Authentication"
        title="Login to Your Account"
        subtitle="Access organizer tools or participant registration features."
      />

      <AuthForm mode="login" onSubmit={handleLogin} busy={authBusy} />

      <p className="text-center muted">
        No account yet? <Link to="/register">Create one now.</Link>
      </p>
    </div>
  );
}
