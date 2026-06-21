import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

const ORANGE = "#FE5900";
const GEIST = "'Geist', sans-serif";
const PP_MORI = "'PP Mori', sans-serif";

const navItems = [
  { label: "Dashboard", icon: "/dashboard-icon.svg", href: "/admin/dashboard" },
  { label: "User Management", icon: "/user-icon.svg", href: "/admin/user-management" },
  { label: "Job Post Management", icon: "/job-icon.svg", href: "/job-post-management" },
  { label: "Notifications", icon: "/notifcation-icon.svg", href: "/notifications" },
  { label: "Ticket Management", icon: "/ticket-icon.svg", href: "/ticket-management" },
  { label: "Subscription Management", icon: "/sub-icon.svg", href: "/admin/subscription-management" },
  { label: "Dashboard Manager", icon: "/dash-manager-icon.svg", href: "/dashboard-manager" },
];

// Roles other than "admin" only ever see the one page they're scoped to.
const ROLE_VISIBLE_HREFS = {
  "user manager": ["/admin/user-management"],
  "ticket manager": ["/ticket-management"],
};

function NavIcon({ src, isActive }) {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        flexShrink: 0,
        transform: "translateY(-2px)",
        WebkitMask: `url(${src}) no-repeat center / contain`,
        mask: `url(${src}) no-repeat center / contain`,
        backgroundColor: isActive ? ORANGE : "rgba(255,255,255,0.7)",
        transition: "background-color 0.15s",
      }}
    />
  );
}

function NavLink({ item, isActive }) {
  return (
    <Link
      href={item.href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "clamp(8px, 0.8vw, 12px)",
        padding: "clamp(11px, 1vw, 14px) 16px clamp(11px, 1vw, 14px) 20px",
        textDecoration: "none",
        color: isActive ? ORANGE : "rgba(255,255,255,0.7)",
        borderRight: `3px solid ${isActive ? ORANGE : "transparent"}`,
        transition: "color 0.15s",
      }}
    >
      <NavIcon src={item.icon} isActive={isActive} />
      <span
        style={{
          fontFamily: PP_MORI,
          fontWeight: 600,
          fontSize: "clamp(11px, 0.97vw, 14px)",
          lineHeight: "23px",
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {item.label}
      </span>
    </Link>
  );
}

export default function Sidebar({ isOpen, onToggle }) {
  const router = useRouter();
  const settingsActive = router.pathname === "/settings";
  const { role } = useAuth();

  const visibleHrefs = ROLE_VISIBLE_HREFS[role];
  const visibleNavItems = visibleHrefs
    ? navItems.filter((item) => visibleHrefs.includes(item.href))
    : navItems;
  const isRestrictedRole = Boolean(visibleHrefs);

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: 260,
        background: "#000F2C",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease",
        boxShadow: "6px 0 32px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* Logo + collapse button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 14px 12px 20px",
          flexShrink: 0,
        }}
      >
        <Image
          src="/logo.png"
          alt="Linkaro"
          width={155}
          height={78}
          style={{ width: "clamp(110px, 10.8vw, 155px)", height: "auto" }}
          priority
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label="Close sidebar"
          style={{
            width: 43,
            height: 43,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/square-circle.png"
            alt="Toggle sidebar"
            style={{ width: 43, height: 43, objectFit: "contain" }}
          />
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: "0 16px 16px 16px", flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              width: 24,
              height: 24,
              WebkitMask: "url(/search-icon.png) no-repeat center / contain",
              mask: "url(/search-icon.png) no-repeat center / contain",
              backgroundColor: "rgba(255,255,255,0.5)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search For Products"
            className="sidebar-search"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "200px",
              padding: "clamp(8px, 0.7vw, 10px) 16px clamp(8px, 0.7vw, 10px) 46px",
              color: "#ffffff",
              fontFamily: GEIST,
              fontWeight: 400,
              fontSize: "clamp(12px, 1.04vw, 15px)",
              lineHeight: "1",
              letterSpacing: "-0.02em",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Nav items */}
      <nav className="sidebar-nav" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={router.pathname === item.href}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.12)",
            margin: "0 16px",
          }}
        />

        {/* Settings & Configuration — restricted roles only see their one page */}
        {!isRestrictedRole && (
          <Link
            href="/settings"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(8px, 0.8vw, 12px)",
              padding: "clamp(11px, 1vw, 14px) 16px clamp(11px, 1vw, 14px) 20px",
              textDecoration: "none",
              color: settingsActive ? ORANGE : "rgba(255,255,255,0.7)",
              borderRight: `3px solid ${settingsActive ? ORANGE : "transparent"}`,
            }}
          >
            <NavIcon src="/setting-icon.svg" isActive={settingsActive} />
            <span
              style={{
                fontFamily: PP_MORI,
                fontWeight: 600,
                fontSize: "clamp(11px, 0.97vw, 14px)",
                lineHeight: "23px",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
              }}
            >
              Settings & Configuration
            </span>
          </Link>
        )}

        {/* Profile */}
        <Link
          href="/settings/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "clamp(12px, 1vw, 16px) 16px clamp(12px, 1vw, 16px) 20px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 34.34,
              height: 34.34,
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <Image
              src="/profile-image.png"
              alt="John Carter"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: GEIST,
                fontWeight: 600,
                fontSize: "clamp(12px, 1.04vw, 15.03px)",
                lineHeight: "15.03px",
                letterSpacing: "0",
                color: "#ffffff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              John Carter
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 3,
              }}
            >
              <span
                style={{
                  fontFamily: GEIST,
                  fontWeight: 400,
                  fontSize: "clamp(10px, 0.89vw, 12.88px)",
                  lineHeight: "15.03px",
                  letterSpacing: "0",
                  color: "rgba(255,255,255,0.42)",
                  whiteSpace: "nowrap",
                }}
              >
                Account settings
              </span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 4L10 8L6 12"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </Link>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(8px, 0.8vw, 12px)",
            width: "100%",
            padding: "clamp(11px, 1vw, 14px) 16px clamp(11px, 1vw, 14px) 20px",
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <NavIcon src="/logout-icon.svg" isActive={false} />
          <span
            style={{
              fontFamily: PP_MORI,
              fontWeight: 600,
              fontSize: "clamp(11px, 0.97vw, 14px)",
              lineHeight: "23px",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
