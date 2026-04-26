import { useMemo, useState } from "react";

const initialStateByMode = {
  login: {
    email: "",
    password: "",
  },
  register: {
    name: "",
    email: "",
    password: "",
    role: "participant",
  },
};

export default function AuthForm({ mode, onSubmit, busy }) {
  const [formData, setFormData] = useState(initialStateByMode[mode]);
  const [error, setError] = useState("");

  const isRegisterMode = mode === "register";

  const title = useMemo(
    () => (isRegisterMode ? "Create Account" : "Welcome Back"),
    [isRegisterMode],
  );

  const buttonLabel = isRegisterMode ? "Create Account" : "Login";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await onSubmit(formData);
    } catch (submitError) {
      setError(submitError.message || "Something went wrong.");
    }
  };

  return (
    <div className="panel auth-panel reveal">
      <h2>{title}</h2>
      <p className="muted">
        {isRegisterMode
          ? "Choose your role and start managing or joining events."
          : "Login to your dashboard and continue where you left off."}
      </p>

      {error ? <p className="alert alert-error">{error}</p> : null}

      <form onSubmit={handleSubmit} className="form-grid">
        {isRegisterMode ? (
          <label className="field">
            <span>Full Name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </label>
        ) : null}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            minLength={6}
            required
          />
        </label>

        {isRegisterMode ? (
          <label className="field">
            <span>Role</span>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="participant">Participant</option>
              <option value="organizer">Organizer</option>
            </select>
          </label>
        ) : null}

        <button type="submit" className="button button-primary" disabled={busy}>
          {busy ? "Please wait..." : buttonLabel}
        </button>
      </form>
    </div>
  );
}
