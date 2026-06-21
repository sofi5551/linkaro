import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiFetch } from "@/lib/api";

// The dashboard (Vercel) and the API (Render) are on unrelated domains, so
// the session cookie set by the backend is never visible to this app's own
// requests — an edge-middleware cookie check can't work here. Auth is
// instead verified client-side by asking the backend directly.
const PUBLIC_PATHS = ["/", "/privacy-policy", "/terms-of-services"];

// Roles other than "admin" are confined to a single page of the dashboard.
const ROLE_HOME = {
  "user manager": "/admin/user-management",
  "ticket manager": "/ticket-management",
};

const AuthContext = createContext({ role: null, loading: true });

export function AuthProvider({ children }) {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (PUBLIC_PATHS.includes(router.pathname)) {
      setLoading(false);
      return;
    }

    setLoading(true);

    apiFetch("/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("unauthorized");
        return res.json();
      })
      .then((data) => {
        if (cancelled || !data.success) throw new Error("unauthorized");

        setRole(data.role);

        const home = ROLE_HOME[data.role];
        if (home && router.pathname !== home) {
          router.replace(home);
          return; // stay "loading" — the new route's own effect will resolve
        }

        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        router.replace("/");
        // stay "loading" until the redirect actually lands on "/"
      });

    return () => {
      cancelled = true;
    };
  }, [router.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const isPublic = PUBLIC_PATHS.includes(router.pathname);

  return (
    <AuthContext.Provider value={{ role, loading }}>
      {isPublic || !loading ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
