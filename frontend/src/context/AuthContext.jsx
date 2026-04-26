import { useMemo, useState } from "react";
import { AuthContext } from "./authContextValue";
import { authService } from "../services/authService";
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from "../utils/storage";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [authBusy, setAuthBusy] = useState(false);

  const login = async (credentials) => {
    setAuthBusy(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setStoredUser(response.user);
      return response;
    } finally {
      setAuthBusy(false);
    }
  };

  const register = async (payload) => {
    setAuthBusy(true);
    try {
      const response = await authService.register(payload);
      setUser(response.user);
      setStoredUser(response.user);
      return response;
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = () => {
    clearStoredUser();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      authBusy,
      isAuthenticated: Boolean(user),
      isOrganizer: user?.role === "organizer",
      isParticipant: user?.role === "participant",
      login,
      register,
      logout,
    }),
    [user, authBusy],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
