import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../components/auth/AuthForm";
import { useAuth } from "../hooks/useAuth";
import SectionHeader from "../components/common/SectionHeader";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, authBusy } = useAuth();

  const handleRegister = async (payload) => {
    await register(payload);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="page narrow-page">
      <SectionHeader
        eyebrow="Create Account"
        title="Join EventFlow Pro"
        subtitle="Register as organizer or participant based on your activity."
      />

      <AuthForm mode="register" onSubmit={handleRegister} busy={authBusy} />

      <p className="text-center muted">
        Already have an account? <Link to="/login">Go to login.</Link>
      </p>
    </div>
  );
}
