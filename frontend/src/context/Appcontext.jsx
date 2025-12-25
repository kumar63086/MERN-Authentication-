import { useState, useEffect, createContext, useContext } from "react";
import api from "../page/apiintersper";
import { toast } from "react-toastify";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  /* ================= FETCH CURRENT USER ================= */
  const fetchUser = async () => {
    try {
      const res = await api.get("/api/v1/auth/me");
      setUser(res.data.user || res.data);
      setIsAuth(true);
    } catch (err) {
        console.error(err);
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGOUT ================= */
  const Logout = async () => {
    try {
      const res = await api.post("/api/v1/auth/logout");
      toast.success(res.data?.message || "Logged out");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    } finally {
      // Always clear client state
      setUser(null);
      setIsAuth(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuth,
        loading,
        setUser,
        setIsAuth,
        fetchUser,
        Logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

/* ================= CUSTOM HOOK ================= */
export const Appdata = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("Appdata must be used within AppProvider");
  }
  return context;
};
