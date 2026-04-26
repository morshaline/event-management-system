import { NavLink, useNavigate } from "react-router-dom";
import { APP_NAME } from "../../config/appConfig";
import { useAuth } from "../../hooks/useAuth";

function navClass({ isActive }) {
  return isActive ? "nav-link active" : "nav-link";
}

export default function NavBar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="site-nav-wrap">
      <nav className="site-nav">
        <NavLink to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            EF
          </span>
          <span>{APP_NAME}</span>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/" className={navClass} end>
            Home
          </NavLink>
          <NavLink to="/events" className={navClass}>
            Events
          </NavLink>
          <NavLink to="/about" className={navClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={navClass}>
            Contact
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
          ) : null}
        </div>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <div className="user-chip" title={user?.email}>
                {user?.name} ({user?.role})
              </div>
              <button type="button" className="button button-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="button button-secondary">
                Login
              </NavLink>
              <NavLink to="/register" className="button button-primary">
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
