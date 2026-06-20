import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import { apiFetch } from "@/lib/api";

const SIDEBAR_W = 260;
const COLLAPSED_W = 56;
const PER_PAGE = 10;
const ORANGE = "#FE5900";
const GEIST = "'Geist', sans-serif";
const PP_MORI = "'PP Mori', sans-serif";

function formatStat(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${day}-${months[d.getMonth()]}-${d.getFullYear().toString().slice(-2)}`;
}

function StatusBadge({ status }) {
  const s = (status != null ? String(status) : "").toLowerCase();
  let bg, color, label;
  if (s === "true" || s === "active" || s === "approved" || s === "verified") {
    bg = "rgba(20,202,116,0.12)"; color = "#14CA74";
    label = s === "true" ? "Verified" : status;
  } else if (s === "pending") {
    bg = "rgba(255,184,0,0.12)"; color = "#FFB800";
    label = status;
  } else if (s === "false" || s === "rejected" || s === "suspended" || s === "blocked" || s === "inactive") {
    bg = "rgba(255,90,101,0.12)"; color = "#FF5A65";
    label = s === "false" ? "Unverified" : status;
  } else {
    bg = "rgba(255,255,255,0.08)"; color = "rgba(255,255,255,0.45)";
    label = status;
  }
  return (
    <span
      style={{
        display: "inline-block",
        background: bg,
        color,
        fontFamily: GEIST,
        fontWeight: 500,
        fontSize: "clamp(12px, 1vw, 14px)",
        padding: "4px 10px",
        borderRadius: 50,
        whiteSpace: "nowrap",
        textTransform: "capitalize",
      }}
    >
      {label || "—"}
    </span>
  );
}

function SortIcon() {
  return (
    <svg
      width="9"
      height="13"
      viewBox="0 0 7 10"
      fill="none"
      style={{ marginLeft: 4, flexShrink: 0 }}
    >
      <path d="M3.5 0L7 4H0L3.5 0Z" fill="rgba(255,255,255,0.35)" />
      <path d="M3.5 10L0 6H7L3.5 10Z" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

function HamburgerLines() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: 20,
            height: 2,
            background: "#fff",
            borderRadius: 1,
          }}
        />
      ))}
    </>
  );
}

const CARDS = [
  {
    label: "Total Users",
    icon: "/total-users-icon.svg",
    key: "totalUsers",
    pct: "+28.4%",
    up: true,
  },
  {
    label: "Service providers",
    icon: "/service-providers-icon.svg",
    key: "serviceProviders",
    pct: "+15.3%",
    up: true,
  },
  {
    label: "Consumers",
    icon: "/consumers-icon.svg",
    key: "consumers",
    pct: "+11.5%",
    up: true,
  },
  {
    label: "Monthly Revenue",
    icon: "/monthly-revenue-icon.svg",
    key: "monthlyRevenue",
    pct: "-5.2%",
    up: false,
  },
];

export default function UserManagement() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    serviceProviders: 0,
    consumers: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [regFilter, setRegFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, regFilter]);

  function fetchData(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    apiFetch("/admin/get-users")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.users);
          setStats(data.stats);
        }
      })
      .finally(() => { setLoading(false); setRefreshing(false); });
  }

  useEffect(() => { fetchData(); }, []);

  async function handleDelete(id) {
    await apiFetch(`/admin/delete-user?id=${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u._id?.toString() !== id));
    setDeleteModal(null);
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const nameMatch =
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q);
    const roleMatch = roleFilter === "all" || u.role === roleFilter;
    const regMatch =
      regFilter === "all" ||
      (regFilter === "unverified" && u.registrationStatus === false) ||
      (regFilter === "verified" && u.registrationStatus === true);
    return nameMatch && roleMatch && regMatch;
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
    background: "transparent",
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

  return (
    <>
      <Head>
        <title>User Management — Linkaro</title>
      </Head>

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />

      {!sidebarOpen && (
        <div
          className="sidebar-collapsed-strip"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: COLLAPSED_W,
            background: "#000F2C",
            borderRight: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 18,
            zIndex: 99,
          }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px 6px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
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
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 101,
            width: 40,
            height: 40,
            background: "#000F2C",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          }}
        >
          <HamburgerLines />
        </button>
      )}

      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
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
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "clamp(12px, 1.2vw, 16px)",
            marginBottom: "clamp(20px, 2vw, 32px)",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: PP_MORI,
                fontWeight: 600,
                fontSize: "clamp(18px, 1.67vw, 24px)",
                lineHeight: "19px",
                letterSpacing: "-0.02em",
                color: "#ffffff",
                margin: "0 0 6px 0",
              }}
            >
              Welcome Back, John
            </h1>
            <p
              style={{
                fontFamily: GEIST,
                fontWeight: 400,
                fontSize: "clamp(11px, 0.97vw, 14px)",
                lineHeight: "21px",
                letterSpacing: "0.02em",
                color: "rgba(255,255,255,0.55)",
                margin: 0,
              }}
            >
              Measure your advertising ROI and report website traffic.
            </p>
          </div>

          <div style={{ display: "flex", gap: "clamp(8px, 0.8vw, 12px)", flexWrap: "wrap" }}>
            {/* REFRESH BUTTON — uncomment to enable
            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              title="Refresh"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                gap: 6,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: "clamp(7px, 0.65vw, 10px) clamp(14px, 1.3vw, 20px)",
                fontFamily: GEIST,
                fontWeight: 500,
                fontSize: "clamp(10px, 0.83vw, 12px)",
                color: "#ffffff",
                cursor: refreshing ? "not-allowed" : "pointer",
                opacity: refreshing ? 0.6 : 1,
                whiteSpace: "nowrap",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (!refreshing) e.currentTarget.style.background = "rgba(254,89,0,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
            >
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none", flexShrink: 0 }}
              >
                <path d="M13 7A6 6 0 1 1 7 1a6 6 0 0 1 4.243 1.757L13 1v4h-4l1.5-1.5A4 4 0 1 0 11 7" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            */}

            <button
              type="button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 50,
                padding: "clamp(7px, 0.65vw, 10px) clamp(14px, 1.3vw, 20px)",
                fontFamily: GEIST,
                fontWeight: 500,
                fontSize: "clamp(10px, 0.83vw, 12px)",
                lineHeight: "14px",
                letterSpacing: "0",
                color: "#ffffff",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <img
                src="/download-icon.png"
                alt=""
                onError={(e) => { e.target.style.display = "none"; }}
                style={{ width: 14, height: 14, filter: "brightness(0) invert(1)" }}
              />
              Export data
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div
          className="user-stats-grid"
          style={{ marginBottom: "clamp(20px, 2vw, 32px)" }}
        >
          {CARDS.map((card) => {
            const value =
              card.key === "monthlyRevenue"
                ? "Rs " + formatStat(stats[card.key])
                : formatStat(stats[card.key]);
            const pctColor = card.up ? "#14CA74" : "#FF5A65";
            const pctBg = card.up ? "#05C16833" : "#FF5A6533";
            return (
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        flexShrink: 0,
                        WebkitMask: `url(${card.icon}) no-repeat center / contain`,
                        mask: `url(${card.icon}) no-repeat center / contain`,
                        backgroundColor: "rgba(10, 116, 236, 0.7)",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: GEIST,
                        fontWeight: 500,
                        fontSize: "clamp(10px, 0.83vw, 12px)",
                        lineHeight: "14px",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {card.label}
                    </span>
                  </div>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: 16,
                      lineHeight: 1,
                      cursor: "pointer",
                    }}
                  >
                    ···
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "clamp(8px, 0.8vw, 12px)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: PP_MORI,
                      fontWeight: 600,
                      fontSize: "clamp(18px, 1.67vw, 24px)",
                      lineHeight: "32px",
                      letterSpacing: "0",
                      color: "#ffffff",
                    }}
                  >
                    {loading ? "—" : value}
                  </span>
                  <span
                    style={{
                      fontFamily: GEIST,
                      fontWeight: 500,
                      fontSize: "clamp(12px, 1vw, 14px)",
                      lineHeight: "14px",
                      color: pctColor,
                      background: pctBg,
                      borderRadius: 50,
                      padding: "2px 6px",
                    }}
                  >
                    {card.pct}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "clamp(8px, 0.8vw, 12px)",
            marginBottom: "clamp(12px, 1.2vw, 18px)",
          }}
        >
          <div
            style={{ position: "relative", flex: "1 1 180px", maxWidth: 280 }}
          >
            <img
              src="/search-icon.png"
              alt=""
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 14,
                height: 14,
                opacity: 0.4,
                pointerEvents: "none",
              }}
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
                padding:
                  "clamp(7px, 0.65vw, 10px) 14px clamp(7px, 0.65vw, 10px) 32px",
                fontFamily: GEIST,
                fontSize: "clamp(10px, 0.8vw, 12px)",
                color: "#ffffff",
                outline: "none",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: "clamp(4px, 0.5vw, 8px)",
              flexWrap: "wrap",
            }}
          >
            {[
              ["all", "All"],
              ["provider", "Service Providers"],
              ["consumer", "Consumers"],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setRoleFilter(val)}
                style={{
                  fontFamily: GEIST,
                  fontSize: "clamp(9px, 0.75vw, 11px)",
                  fontWeight: roleFilter === val ? 600 : 400,
                  padding: "clamp(5px, 0.5vw, 8px) clamp(10px, 1vw, 16px)",
                  borderRadius: 50,
                  border: roleFilter === val ? "none" : "1px solid rgba(255,255,255,0.2)",
                  background: roleFilter === val ? ORANGE : "transparent",
                  color: "#ffffff",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Registration status filter */}
          <div
            style={{
              display: "flex",
              gap: "clamp(4px, 0.5vw, 8px)",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: GEIST,
                fontSize: "clamp(9px, 0.75vw, 11px)",
                color: "rgba(255,255,255,0.35)",
                whiteSpace: "nowrap",
              }}
            >
              Registration:
            </span>
            {[
              ["all", "All"],
              ["verified", "Verified"],
              ["unverified", "Unverified"],
            ].map(([val, label]) => {
              const isActive = regFilter === val;
              let activeBg = ORANGE;
              if (val === "verified") activeBg = "rgba(20,202,116,0.85)";
              if (val === "unverified") activeBg = "rgba(255,90,101,0.85)";
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRegFilter(val)}
                  style={{
                    fontFamily: GEIST,
                    fontSize: "clamp(9px, 0.75vw, 11px)",
                    fontWeight: isActive ? 600 : 400,
                    padding: "clamp(5px, 0.5vw, 8px) clamp(10px, 1vw, 16px)",
                    borderRadius: 50,
                    border: isActive ? "none" : "1px solid rgba(255,255,255,0.2)",
                    background: isActive ? activeBg : "transparent",
                    color: "#ffffff",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table container */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "clamp(12px, 1.1vw, 16px) clamp(14px, 1.4vw, 20px)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span
              style={{
                fontFamily: GEIST,
                fontWeight: 500,
                fontSize: "clamp(13px, 1.1vw, 16px)",
                lineHeight: "18px",
                color: "#ffffff",
              }}
            >
              All Users
            </span>
            <span
              style={{
                fontFamily: GEIST,
                fontWeight: 400,
                fontSize: "clamp(9px, 0.76vw, 11px)",
              }}
            >
              {loading ? (
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Loading…</span>
              ) : (
                <>
                  <span style={{ color: ORANGE }}>
                    {filtered.length === 0 ? 0 : startIdx + 1} – {endIdx}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>
                    {" "}
                    of {filtered.length}
                  </span>
                </>
              )}
            </span>
          </div>

          {/* Table */}
          <div className="table-scroll" style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 860,
              }}
            >
              <thead>
                <tr>
                  {["Name", "Phone", "Date of Joining", "Category", "Registration Status"].map((h) => (
                    <th key={h} style={thStyle}>
                      <span
                        style={{ display: "inline-flex", alignItems: "center" }}
                      >
                        {h} <SortIcon />
                      </span>
                    </th>
                  ))}
                  <th style={{ ...thStyle, width: 80, minWidth: 80 }} />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        fontFamily: GEIST,
                        fontSize: "clamp(12px, 1vw, 14px)",
                        color: "rgba(255,255,255,0.4)",
                        padding: "clamp(20px, 2vw, 32px)",
                        textAlign: "center",
                      }}
                    >
                      Loading…
                    </td>
                  </tr>
                ) : pageData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        fontFamily: GEIST,
                        fontSize: "clamp(12px, 1vw, 14px)",
                        color: "rgba(255,255,255,0.4)",
                        padding: "clamp(20px, 2vw, 32px)",
                        textAlign: "center",
                      }}
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  pageData.map((row, i) => {
                    const bg = i % 2 === 0 ? "#0A1330" : "transparent";
                    const tdBase = {
                      fontFamily: GEIST,
                      fontWeight: 400,
                      fontSize: "clamp(12px, 1vw, 14px)",
                      lineHeight: "14px",
                      color: "#AEB9E1",
                      padding:
                        "clamp(10px, 0.9vw, 14px) clamp(10px, 1vw, 16px)",
                      background: bg,
                    };
                    return (
                      <tr key={row._id}>
                        {/* Name column */}
                        <td style={{ ...tdBase, minWidth: 160 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "clamp(6px, 0.6vw, 10px)",
                            }}
                          >
                            <img
                              src={row.profileImage || "/dummy-profile.png"}
                              alt=""
                              referrerPolicy="no-referrer"
                              style={{
                                width: "clamp(36px, 3vw, 44px)",
                                height: "clamp(36px, 3vw, 44px)",
                                borderRadius: "50%",
                                objectFit: "cover",
                                flexShrink: 0,
                              }}
                              onError={(e) => {
                                e.target.src = "/dummy-profile.png";
                              }}
                            />
                            <div>
                              <div
                                style={{
                                  fontFamily: GEIST,
                                  fontWeight: 500,
                                  fontSize: "clamp(12px, 1vw, 14px)",
                                  lineHeight: "14px",
                                  color: "#ffffff",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {row.name || "—"}
                              </div>
                              <div
                                style={{
                                  fontFamily: GEIST,
                                  fontWeight: 400,
                                  fontSize: "clamp(12px, 1vw, 14px)",
                                  lineHeight: "14px",
                                  color: "#AEB9E1",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {row.email || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={tdBase}>{row.phone || "—"}</td>
                        <td style={tdBase}>{formatDate(row.createdAt)}</td>
                        <td style={tdBase}>
                          {row.role === "provider"
                            ? "Service Provider"
                            : row.role === "consumer"
                              ? "Consumer"
                              : "—"}
                        </td>
                        <td style={tdBase}>
                          <StatusBadge status={row.registrationStatus} />
                        </td>
                        {/* Actions */}
                        <td style={{ ...tdBase, textAlign: "center", minWidth: 80 }}>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "clamp(6px, 0.6vw, 10px)",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                router.push(`/admin/user/${row._id}`)
                              }
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <img
                                src="/edit-pencil-icon.png"
                                alt="Edit"
                                style={{
                                  width: "clamp(18px, 1.5vw, 22px)",
                                  height: "clamp(18px, 1.5vw, 22px)",
                                  filter: "brightness(0) invert(1)",
                                  opacity: 0.6,
                                }}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteModal(row._id?.toString())
                              }
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <img
                                src="/bin-icon.png"
                                alt="Delete"
                                style={{
                                  width: "clamp(18px, 1.5vw, 22px)",
                                  height: "clamp(18px, 1.5vw, 22px)",
                                  filter: "brightness(0) invert(1)",
                                  opacity: 0.6,
                                }}
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "clamp(4px, 0.5vw, 8px)",
            marginTop: "clamp(16px, 1.5vw, 24px)",
          }}
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              ...pageBtnBase,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color:
                page === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
              cursor: page === 1 ? "not-allowed" : "pointer",
            }}
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
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              ...pageBtnBase,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color:
                page === totalPages
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(255,255,255,0.7)",
              cursor: page === totalPages ? "not-allowed" : "pointer",
            }}
          >
            ›
          </button>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
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
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#FF5A6520",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <img
                src="/bin-icon.png"
                alt=""
                style={{
                  width: 22,
                  height: 22,
                  filter:
                    "brightness(0) saturate(100%) invert(42%) sepia(80%) saturate(600%) hue-rotate(310deg)",
                }}
              />
            </div>
            <h3
              style={{
                fontFamily: PP_MORI,
                fontWeight: 600,
                fontSize: "clamp(16px, 1.4vw, 20px)",
                color: "#ffffff",
                margin: "0 0 8px 0",
              }}
            >
              Are you sure?
            </h3>
            <p
              style={{
                fontFamily: GEIST,
                fontWeight: 400,
                fontSize: "clamp(11px, 0.9vw, 13px)",
                color: "rgba(255,255,255,0.5)",
                margin: "0 0 24px 0",
                lineHeight: "1.5",
              }}
            >
              This will permanently delete the user account and cannot be
              undone.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                style={{
                  fontFamily: GEIST,
                  fontWeight: 400,
                  fontSize: "clamp(11px, 0.9vw, 13px)",
                  padding: "clamp(9px, 0.85vw, 12px) clamp(20px, 2vw, 32px)",
                  borderRadius: 50,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteModal)}
                style={{
                  fontFamily: GEIST,
                  fontWeight: 400,
                  fontSize: "clamp(11px, 0.9vw, 13px)",
                  padding: "clamp(9px, 0.85vw, 12px) clamp(20px, 2vw, 32px)",
                  borderRadius: 50,
                  background: "#FF5A65",
                  border: "none",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .table-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(254,89,0,0.55) rgba(255,255,255,0.04);
        }
        .table-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .table-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          margin: 0 16px;
        }
        .table-scroll::-webkit-scrollbar-thumb {
          background: rgba(254,89,0,0.55);
          border-radius: 10px;
        }
        .table-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(254,89,0,0.9);
        }
        .user-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(10px, 1vw, 16px);
        }
        @media (max-width: 900px) {
          .user-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .user-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
