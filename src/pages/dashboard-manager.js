import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Sidebar from "@/components/Sidebar";
import StatusToast from "@/components/toaster/toast";
import { apiFetch } from "@/lib/api";

const SIDEBAR_W = 260;
const COLLAPSED_W = 56;
const PER_PAGE = 10;
const ORANGE = "#FE5900";
const BLUE = "#3B82F6";
const LIGHT_BLUE = "#5ED3F3";
const GEIST = "'Geist', sans-serif";
const PP_MORI = "'PP Mori', sans-serif";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "user manager", label: "User Manager" },
  { value: "ticket manager", label: "Ticket Manager" },
];

const ROLE_COLOR = {
  admin: ORANGE,
  "user manager": BLUE,
  "ticket manager": LIGHT_BLUE,
};

const CARDS = [
  { key: "total", label: "All Managers", icon: "/dash-manager-icon.svg", color: "rgba(255,255,255,0.7)" },
  { key: "admin", label: "Admins", icon: "/setting-icon.svg", color: ORANGE },
  { key: "userManager", label: "User Managers", icon: "/user-icon.svg", color: BLUE },
  { key: "ticketManager", label: "Ticket Managers", icon: "/ticket-icon.svg", color: LIGHT_BLUE },
];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day}-${months[d.getMonth()]}-${d.getFullYear().toString().slice(-2)}`;
}

function HamburgerLines() {
  return (
    <>
      <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 1 }} />
      <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 1 }} />
      <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 1 }} />
    </>
  );
}

function RoleBadge({ role }) {
  const color = ROLE_COLOR[role] || "rgba(255,255,255,0.45)";
  const label = ROLE_OPTIONS.find((o) => o.value === role)?.label || role;
  return (
    <span
      style={{
        display: "inline-block",
        background: `${color}20`,
        color,
        fontFamily: GEIST,
        fontWeight: 500,
        fontSize: "clamp(11px, 0.9vw, 12px)",
        padding: "3px 10px",
        borderRadius: 50,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function RoleSelect({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = ROLE_OPTIONS.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 8,
          padding: "10px 14px",
          fontFamily: GEIST,
          fontSize: "clamp(12px, 1vw, 14px)",
          color: disabled ? "rgba(255,255,255,0.4)" : "#ffffff",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
        }}
      >
        {current?.label || "Select role"}
        {!disabled && (
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
            <path d="M1 1L5 5L9 1" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#0D1B3E",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            zIndex: 50,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          {ROLE_OPTIONS.map((o) => (
            <div
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              style={{
                padding: "10px 14px",
                fontFamily: GEIST,
                fontSize: "clamp(12px, 1vw, 14px)",
                color: o.value === value ? ORANGE : "#ffffff",
                background: o.value === value ? "rgba(254,89,0,0.1)" : "transparent",
                cursor: "pointer",
              }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardManager() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [managers, setManagers] = useState([]);
  const [stats, setStats] = useState({ total: 0, admin: 0, userManager: 0, ticketManager: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formId, setFormId] = useState(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("admin");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  function fetchManagers() {
    setLoading(true);
    apiFetch("/admin/get-managers")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setManagers(data.managers);
          setStats(data.stats);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  function openCreate(role) {
    setFormMode("create");
    setFormId(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole(role);
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(manager) {
    setFormMode("edit");
    setFormId(manager._id);
    setFormName(manager.name || "");
    setFormEmail(manager.email || "");
    setFormPassword("");
    setFormRole(manager.role);
    setFormError("");
    setFormOpen(true);
  }

  async function handleSubmit() {
    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Name and email are required.");
      return;
    }
    if (formMode === "create" && formPassword.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (formPassword && formPassword.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const body =
        formMode === "create"
          ? { name: formName.trim(), email: formEmail.trim(), password: formPassword, role: formRole }
          : { id: formId, name: formName.trim(), email: formEmail.trim(), role: formRole, ...(formPassword ? { password: formPassword } : {}) };

      const res = await apiFetch(formMode === "create" ? "/admin/create-manager" : "/admin/update-manager", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setToast({ show: true, message: formMode === "create" ? "Manager account created." : "Manager account updated.", type: "success" });
      setFormOpen(false);
      fetchManagers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiFetch(`/admin/delete-manager?id=${deleteId}`, { method: "DELETE" });
      setManagers((prev) => prev.filter((m) => m._id !== deleteId));
      setToast({ show: true, message: "Manager account deleted.", type: "success" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const filtered = managers.filter((m) => {
    const q = search.toLowerCase();
    return (m.name || "").toLowerCase().includes(q) || (m.email || "").toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const startIdx = (page - 1) * PER_PAGE;
  const endIdx = Math.min(startIdx + PER_PAGE, filtered.length);
  const pageData = filtered.slice(startIdx, endIdx);

  const thStyle = {
    fontFamily: GEIST,
    fontWeight: 400,
    fontSize: "clamp(12px, 1vw, 14px)",
    lineHeight: "14px",
    color: "rgba(255,255,255,0.5)",
    padding: "clamp(10px, 0.9vw, 14px) clamp(10px, 1vw, 16px)",
    textAlign: "left",
    whiteSpace: "nowrap",
  };

  const pageBtnBase = {
    width: 32,
    height: 32,
    borderRadius: 6,
    fontFamily: GEIST,
    fontSize: "clamp(11px, 0.9vw, 13px)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const createButtonStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 50,
    padding: "clamp(7px, 0.65vw, 10px) clamp(14px, 1.3vw, 18px)",
    fontFamily: GEIST,
    fontWeight: 500,
    fontSize: "clamp(10px, 0.83vw, 12px)",
    color: "#ffffff",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  return (
    <>
      <StatusToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      <Head>
        <title>Dashboard Manager — Linkaro</title>
      </Head>

      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />

      {!sidebarOpen && (
        <div
          className="sidebar-collapsed-strip"
          style={{
            position: "fixed", top: 0, left: 0, height: "100vh", width: COLLAPSED_W,
            background: "#000F2C", borderRight: "1px solid rgba(255,255,255,0.1)",
            display: "flex", flexDirection: "column", alignItems: "center",
            paddingTop: 18, zIndex: 99,
          }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "8px 6px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 5,
            }}
          >
            <HamburgerLines />
          </button>
        </div>
      )}

      {!sidebarOpen && (
        <button
          className="mobile-hamburger"
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          style={{
            position: "fixed", top: 16, left: 16, zIndex: 101,
            width: 40, height: 40, background: "#000F2C",
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
            cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 5,
          }}
        >
          <HamburgerLines />
        </button>
      )}

      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <main
        className="dashboard-main"
        style={{
          minHeight: "100vh",
          background: "#000F2C",
          marginLeft: sidebarOpen ? SIDEBAR_W : COLLAPSED_W,
          transition: "margin-left 0.3s ease",
          padding: "clamp(20px, 2.5vw, 40px)",
          color: "#ffffff",
        }}
      >
        {/* Header */}
        <div
          className="page-header-row"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "clamp(12px, 1.2vw, 16px)",
            marginBottom: "clamp(20px, 2vw, 32px)",
          }}
        >
          <div className="page-header-title">
            <h1
              style={{
                fontFamily: PP_MORI,
                fontWeight: 600,
                fontSize: "clamp(18px, 1.67vw, 24px)",
                lineHeight: "29px",
                letterSpacing: "-0.02em",
                color: "#ffffff",
                margin: "0 0 6px 0",
              }}
            >
              Dashboard Manager
            </h1>
            <p
              style={{
                fontFamily: GEIST,
                fontWeight: 400,
                fontSize: "clamp(11px, 0.97vw, 14px)",
                lineHeight: "21px",
                color: "rgba(255,255,255,0.55)",
                margin: 0,
              }}
            >
              Manage admin, user manager and ticket manager accounts.
            </p>
          </div>

          <div style={{ display: "flex", gap: "clamp(8px, 0.8vw, 12px)", flexWrap: "wrap" }}>
            <button type="button" style={createButtonStyle} onClick={() => openCreate("admin")}>
              Create New Admin
            </button>
            <button type="button" style={createButtonStyle} onClick={() => openCreate("user manager")}>
              Create New User Manager
            </button>
            <button type="button" style={{ ...createButtonStyle, background: ORANGE, border: "none" }} onClick={() => openCreate("ticket manager")}>
              Create New Ticket Manager
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="dm-stats-grid" style={{ marginBottom: "clamp(20px, 2vw, 32px)" }}>
          {CARDS.map((card) => (
            <div
              key={card.key}
              style={{
                background: "rgba(255,255,255,0.13)",
                borderRadius: 20,
                padding: "clamp(14px, 1.3vw, 20px) clamp(16px, 1.5vw, 22px)",
                display: "flex",
                flexDirection: "column",
                gap: "clamp(8px, 0.8vw, 12px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    flexShrink: 0,
                    WebkitMask: `url(${card.icon}) no-repeat center / contain`,
                    mask: `url(${card.icon}) no-repeat center / contain`,
                    backgroundColor: card.color,
                  }}
                />
                <span style={{ fontFamily: GEIST, fontWeight: 500, fontSize: "clamp(10px, 0.83vw, 12px)", color: "rgba(255,255,255,0.7)" }}>
                  {card.label}
                </span>
              </div>
              <span style={{ fontFamily: PP_MORI, fontWeight: 600, fontSize: "clamp(18px, 1.67vw, 24px)", color: "#ffffff" }}>
                {loading ? "—" : stats[card.key]}
              </span>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: "clamp(12px, 1.2vw, 18px)" }}>
          <div style={{ position: "relative", flex: "1 1 180px", maxWidth: 280 }}>
            <img
              src="/search-icon.png"
              alt=""
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, opacity: 0.4, pointerEvents: "none" }}
            />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                padding: "clamp(7px, 0.65vw, 10px) 14px clamp(7px, 0.65vw, 10px) 32px",
                fontFamily: GEIST,
                fontSize: "clamp(10px, 0.8vw, 12px)",
                color: "#ffffff",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, overflow: "hidden" }}>
          <div className="table-scroll" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
              <thead>
                <tr>
                  {["Name", "Email", "Role", "Date Joined"].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                  <th style={{ ...thStyle, width: 80, minWidth: 80 }} />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ fontFamily: GEIST, fontSize: 13, color: "rgba(255,255,255,0.4)", padding: 24, textAlign: "center" }}>
                      Loading…
                    </td>
                  </tr>
                ) : pageData.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ fontFamily: GEIST, fontSize: 13, color: "rgba(255,255,255,0.4)", padding: 24, textAlign: "center" }}>
                      No manager accounts found.
                    </td>
                  </tr>
                ) : (
                  pageData.map((m, i) => {
                    const bg = i % 2 === 0 ? "#0A1330" : "transparent";
                    const td = {
                      fontFamily: GEIST, fontWeight: 400, fontSize: "clamp(12px, 1vw, 14px)",
                      color: "#ffffff", padding: "clamp(10px, 0.9vw, 14px) clamp(10px, 1vw, 16px)",
                      background: bg, whiteSpace: "nowrap",
                    };
                    return (
                      <tr key={m._id}>
                        <td style={td}>{m.name || "—"}</td>
                        <td style={td}>{m.email || "—"}</td>
                        <td style={td}><RoleBadge role={m.role} /></td>
                        <td style={td}>{formatDate(m.createdAt)}</td>
                        <td style={{ ...td, textAlign: "center" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "clamp(6px, 0.6vw, 10px)" }}>
                            <button
                              type="button"
                              onClick={() => openEdit(m)}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "inline-flex" }}
                            >
                              <img
                                src="/edit-pencil-icon.png"
                                alt="Edit"
                                style={{ width: "clamp(18px, 1.5vw, 22px)", height: "clamp(18px, 1.5vw, 22px)", filter: "brightness(0) invert(1)", opacity: 0.6 }}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteId(m._id)}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "inline-flex" }}
                            >
                              <img
                                src="/bin-icon.png"
                                alt="Delete"
                                style={{ width: "clamp(18px, 1.5vw, 22px)", height: "clamp(18px, 1.5vw, 22px)", filter: "brightness(0) invert(1)", opacity: 0.6 }}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filtered.length > PER_PAGE && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "clamp(4px, 0.5vw, 8px)", marginTop: "clamp(16px, 1.5vw, 24px)" }}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ ...pageBtnBase, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: page === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)" }}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                style={{
                  ...pageBtnBase,
                  border: page === p ? "none" : "1px solid rgba(255,255,255,0.2)",
                  background: page === p ? ORANGE : "transparent",
                  color: page === p ? "#ffffff" : "rgba(255,255,255,0.7)",
                  fontWeight: page === p ? 600 : 400,
                }}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ ...pageBtnBase, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: page === totalPages ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)" }}
            >
              ›
            </button>
          </div>
        )}
      </main>

      {/* Create / Edit modal */}
      {formOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
        >
          <div
            style={{
              background: "#000F2C",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: "clamp(24px, 2.5vw, 36px)",
              maxWidth: 420,
              width: "90%",
            }}
          >
            <h3
              style={{
                fontFamily: PP_MORI,
                fontWeight: 600,
                fontSize: "clamp(16px, 1.4vw, 20px)",
                color: "#ffffff",
                margin: "0 0 20px 0",
              }}
            >
              {formMode === "create" ? "Create New Manager" : "Edit Manager"}
            </h3>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontFamily: GEIST, fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px",
                  fontFamily: GEIST, fontSize: "clamp(12px, 1vw, 14px)", color: "#ffffff", outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontFamily: GEIST, fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px",
                  fontFamily: GEIST, fontSize: "clamp(12px, 1vw, 14px)", color: "#ffffff", outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontFamily: GEIST, fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>
                {formMode === "create" ? "Password" : "Password (leave blank to keep current)"}
              </label>
              <input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder={formMode === "create" ? "Min. 6 characters" : "••••••••"}
                style={{
                  width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px",
                  fontFamily: GEIST, fontSize: "clamp(12px, 1vw, 14px)", color: "#ffffff", outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: formError ? 10 : 22 }}>
              <label style={{ display: "block", fontFamily: GEIST, fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>Role</label>
              <RoleSelect value={formRole} onChange={setFormRole} />
            </div>

            {formError && (
              <p style={{ fontFamily: GEIST, fontSize: 12, color: "#FF5A65", margin: "0 0 16px 0" }}>{formError}</p>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={saving}
                style={{
                  fontFamily: GEIST, fontSize: "clamp(11px, 0.9vw, 13px)", padding: "clamp(9px, 0.85vw, 12px) clamp(20px, 2vw, 28px)",
                  borderRadius: 50, background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#ffffff", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  fontFamily: GEIST, fontSize: "clamp(11px, 0.9vw, 13px)", padding: "clamp(9px, 0.85vw, 12px) clamp(20px, 2vw, 28px)",
                  borderRadius: 50, background: ORANGE, border: "none", color: "#ffffff", cursor: "pointer", opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving…" : formMode === "create" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div
            style={{
              background: "#000F2C",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: "clamp(24px, 2.5vw, 40px)",
              maxWidth: 380,
              width: "90%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48, height: 48, borderRadius: "50%", background: "#FF5A6520",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
              }}
            >
              <img
                src="/bin-icon.png"
                alt=""
                style={{ width: 22, height: 22, filter: "brightness(0) saturate(100%) invert(42%) sepia(80%) saturate(600%) hue-rotate(310deg)" }}
              />
            </div>
            <h3 style={{ fontFamily: PP_MORI, fontWeight: 600, fontSize: "clamp(16px, 1.4vw, 20px)", color: "#ffffff", margin: "0 0 8px 0" }}>
              Are you sure?
            </h3>
            <p style={{ fontFamily: GEIST, fontWeight: 400, fontSize: "clamp(11px, 0.9vw, 13px)", color: "rgba(255,255,255,0.5)", margin: "0 0 24px 0", lineHeight: 1.5 }}>
              This will permanently delete this manager account and cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                style={{
                  fontFamily: GEIST, fontSize: "clamp(11px, 0.9vw, 13px)", padding: "clamp(9px, 0.85vw, 12px) clamp(20px, 2vw, 32px)",
                  borderRadius: 50, background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#ffffff", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  fontFamily: GEIST, fontSize: "clamp(11px, 0.9vw, 13px)", padding: "clamp(9px, 0.85vw, 12px) clamp(20px, 2vw, 32px)",
                  borderRadius: 50, background: "#FF5A65", border: "none", color: "#ffffff", cursor: "pointer", opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dm-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(10px, 1vw, 16px);
        }
        @media (max-width: 900px) {
          .dm-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .dm-stats-grid { grid-template-columns: 1fr; }
        }
        .table-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(254,89,0,0.55) rgba(255,255,255,0.04);
        }
        .table-scroll::-webkit-scrollbar { height: 6px; }
        .table-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); border-radius: 10px; }
        .table-scroll::-webkit-scrollbar-thumb { background: rgba(254,89,0,0.55); border-radius: 10px; }
      `}</style>
    </>
  );
}
