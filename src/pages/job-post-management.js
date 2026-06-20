import { useState, useEffect } from "react";
import Head from "next/head";
import Sidebar from "@/components/Sidebar";
import { apiFetch } from "@/lib/api";

const SIDEBAR_W = 260;
const COLLAPSED_W = 56;
const PER_PAGE = 10;
const ORANGE = "#FE5900";
const GEIST = "'Geist', sans-serif";
const PP_MORI = "'PP Mori', sans-serif";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = months[d.getMonth()];
  const year = d.getFullYear().toString().slice(-2);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "p.m" : "a.m";
  hours = hours % 12 || 12;
  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
}

function SortIcon() {
  return (
    <svg
      width="9"
      height="13"
      viewBox="0 0 7 10"
      fill="none"
      style={{ marginLeft: 5, flexShrink: 0 }}
    >
      <path d="M3.5 0L7 4H0L3.5 0Z" fill="rgba(255,255,255,0.35)" />
      <path d="M3.5 10L0 6H7L3.5 10Z" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
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

function StatusBadge({ status }) {
  const s = (status || "open").toLowerCase();
  const colors = {
    open:   { bg: "rgba(34,197,94,0.15)",  text: "#22C55E",  border: "rgba(34,197,94,0.3)" },
    closed: { bg: "rgba(107,114,128,0.15)", text: "#9CA3AF",  border: "rgba(107,114,128,0.3)" },
    filled: { bg: "rgba(59,130,246,0.15)",  text: "#60A5FA",  border: "rgba(59,130,246,0.3)" },
  };
  const c = colors[s] || colors.open;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 50,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontFamily: GEIST,
        fontSize: "clamp(10px, 0.76vw, 11px)",
        fontWeight: 500,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {s}
    </span>
  );
}

export default function JobPostManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search, categoryFilter]);

  useEffect(() => {
    setLoading(true);
    apiFetch("/admin/get-jobs")
      .then((r) => r.json())
      .then((data) => { if (data.success) setJobs(data.jobs); })
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(jobs.map((j) => j.category).filter(Boolean)))];

  const filtered = jobs.filter((row) => {
    const nameMatch =
      (row.consumer?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (row.title || "").toLowerCase().includes(search.toLowerCase());
    const catMatch = categoryFilter === "all" || row.category === categoryFilter;
    return nameMatch && catMatch;
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
    transition: "background 0.15s, color 0.15s",
  };

  return (
    <>
      <Head>
        <title>Job Post Management — Linkaro</title>
      </Head>

      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />

      {/* Desktop collapsed strip */}
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

      {/* Mobile hamburger */}
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
        {/* Page title */}
        <div style={{ marginBottom: "clamp(16px, 1.8vw, 28px)" }}>
          <h1
            style={{
              fontFamily: PP_MORI,
              fontWeight: 600,
              fontSize: "clamp(18px, 1.67vw, 24px)",
              lineHeight: "29px",
              letterSpacing: "-0.02em",
              color: "#ffffff",
              margin: 0,
            }}
          >
            Job Post Management
          </h1>
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
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 180px", maxWidth: 300 }}>
            <img
              src="/search-icon.png"
              alt=""
              style={{
                position: "absolute", left: 10, top: "50%",
                transform: "translateY(-50%)", width: 14, height: 14,
                opacity: 0.4, pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search by consumer or job title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                padding: "clamp(7px, 0.65vw, 10px) clamp(10px, 1vw, 14px) clamp(7px, 0.65vw, 10px) 32px",
                fontFamily: GEIST,
                fontSize: "clamp(10px, 0.8vw, 12px)",
                color: "#ffffff",
                outline: "none",
              }}
            />
          </div>

          {/* Category filter */}
          <div style={{ display: "flex", gap: "clamp(4px, 0.5vw, 8px)", flexWrap: "wrap" }}>
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                style={{
                  fontFamily: GEIST,
                  fontSize: "clamp(9px, 0.75vw, 11px)",
                  fontWeight: categoryFilter === cat ? 600 : 400,
                  padding: "clamp(5px, 0.5vw, 8px) clamp(10px, 1vw, 16px)",
                  borderRadius: 50,
                  border: categoryFilter === cat ? "none" : "1px solid rgba(255,255,255,0.2)",
                  background: categoryFilter === cat ? ORANGE : "transparent",
                  color: "#ffffff",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  whiteSpace: "nowrap",
                }}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
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
          {/* Header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "clamp(12px, 1.1vw, 16px) clamp(14px, 1.4vw, 20px)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span
              style={{
                fontFamily: GEIST,
                fontWeight: 500,
                fontSize: "clamp(13px, 1.1vw, 16px)",
                color: "#ffffff",
              }}
            >
              Posted Jobs
            </span>
            <span style={{ fontFamily: GEIST, fontWeight: 400, fontSize: "clamp(9px, 0.76vw, 11px)" }}>
              {loading ? (
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Loading…</span>
              ) : (
                <>
                  <span style={{ color: ORANGE }}>
                    {filtered.length === 0 ? 0 : startIdx + 1} – {endIdx}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}> of {filtered.length}</span>
                </>
              )}
            </span>
          </div>

          {/* Table */}
          <div className="table-scroll" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
              <thead>
                <tr>
                  <th style={thStyle}><span style={{ display: "inline-flex", alignItems: "center" }}>Consumer <SortIcon /></span></th>
                  <th style={thStyle}><span style={{ display: "inline-flex", alignItems: "center" }}>Job Title <SortIcon /></span></th>
                  <th style={thStyle}><span style={{ display: "inline-flex", alignItems: "center" }}>Category <SortIcon /></span></th>
                  <th style={thStyle}><span style={{ display: "inline-flex", alignItems: "center" }}>Location <SortIcon /></span></th>
                  <th style={thStyle}><span style={{ display: "inline-flex", alignItems: "center" }}>Scheduled <SortIcon /></span></th>
                  <th style={thStyle}><span style={{ display: "inline-flex", alignItems: "center" }}>Status <SortIcon /></span></th>
                  <th style={thStyle}><span style={{ display: "inline-flex", alignItems: "center" }}>Date Posted <SortIcon /></span></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        fontFamily: GEIST, fontSize: "clamp(12px, 1vw, 14px)",
                        color: "rgba(255,255,255,0.4)",
                        padding: "clamp(20px, 2vw, 32px)", textAlign: "center",
                      }}
                    >
                      Loading…
                    </td>
                  </tr>
                ) : pageData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        fontFamily: GEIST, fontSize: "clamp(12px, 1vw, 14px)",
                        color: "rgba(255,255,255,0.4)",
                        padding: "clamp(20px, 2vw, 32px)", textAlign: "center",
                      }}
                    >
                      No jobs found.
                    </td>
                  </tr>
                ) : (
                  pageData.map((row, i) => {
                    const bg = i % 2 === 0 ? "#0A1330" : "transparent";
                    const td = {
                      fontFamily: GEIST, fontWeight: 400,
                      fontSize: "clamp(12px, 1vw, 14px)", lineHeight: "14px",
                      color: "#ffffff",
                      padding: "clamp(10px, 0.9vw, 14px) clamp(10px, 1vw, 16px)",
                      background: bg, whiteSpace: "nowrap",
                    };
                    return (
                      <tr key={row._id}>
                        <td style={td}>{row.consumer?.name || "—"}</td>
                        <td style={{ ...td, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {row.title || "—"}
                        </td>
                        <td style={td}>{row.category || "—"}</td>
                        <td style={{ ...td, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {row.location || "—"}
                        </td>
                        <td style={td}>{row.scheduledTime || "ASAP"}</td>
                        <td style={td}><StatusBadge status={row.status} /></td>
                        <td style={td}>{formatDate(row.createdAt)}</td>
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
            display: "flex", justifyContent: "center", alignItems: "center",
            gap: "clamp(4px, 0.5vw, 8px)", marginTop: "clamp(16px, 1.5vw, 24px)",
          }}
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              ...pageBtnBase, border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: page === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
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
              ...pageBtnBase, border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: page === totalPages ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
              cursor: page === totalPages ? "not-allowed" : "pointer",
            }}
          >
            ›
          </button>
        </div>
      </main>

      <style>{`
        .table-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(254,89,0,0.55) rgba(255,255,255,0.04);
        }
        .table-scroll::-webkit-scrollbar { height: 6px; }
        .table-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.04); border-radius: 10px; margin: 0 16px;
        }
        .table-scroll::-webkit-scrollbar-thumb {
          background: rgba(254,89,0,0.55); border-radius: 10px;
        }
        .table-scroll::-webkit-scrollbar-thumb:hover { background: rgba(254,89,0,0.9); }
      `}</style>
    </>
  );
}
