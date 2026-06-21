import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Sidebar from "@/components/Sidebar";
import StatusToast from "@/components/toaster/toast";
import { apiFetch } from "@/lib/api";

const SIDEBAR_W = 260;
const COLLAPSED_W = 56;
const PER_PAGE = 6;
const ORANGE = "#FE5900";
const PRIORITY_COLOR = "#E85538";
const FILTER_BG = "#FE590026";
const FILTER_ACTIVE = "#FE5900";
const FILTER_INACTIVE = "#AEB9E1";
const CARD_BG = "#FFFFFF21";
const FIELD_BG = "#FFFFFF26";
const IMAGE_BG = "#6F6F6F";
const GEIST = "'Geist', sans-serif";
const PP_MORI = "'PP Mori', sans-serif";

const STATUS_TABS = [
  { value: "ongoing", label: "Ongoing Ticket" },
  { value: "pending", label: "Pending Ticket" },
  { value: "completed", label: "Completed Ticket" },
];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${day}-${month}-${d.getFullYear()}`;
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

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageSlot({ src, editable, onPick, onRemove, onError }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await apiFetch("/admin/upload-image", {
        method: "POST",
        body: JSON.stringify({ image: dataUrl, folder: "tickets" }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.message || "Upload failed");
      }
      onPick(data.url);
    } catch (err) {
      onError?.(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      onClick={() => editable && !uploading && inputRef.current?.click()}
      style={{
        position: "relative",
        width: "100%",
        height: 182,
        background: IMAGE_BG,
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: editable ? "pointer" : "default",
        opacity: uploading ? 0.6 : 1,
      }}
    >
      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: "none" }}
        />
      )}

      {uploading ? (
        <span style={{ fontFamily: GEIST, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
          Uploading…
        </span>
      ) : src ? (
        <>
          <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {editable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: "none",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                fontSize: 13,
                lineHeight: "22px",
                cursor: "pointer",
                padding: 0,
              }}
            >
              ×
            </button>
          )}
        </>
      ) : (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          <path d="M3 16l5-5 4 4 3-3 6 6" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="9" r="1.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
        </svg>
      )}
    </div>
  );
}

export default function TicketManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ongoing");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [solutionText, setSolutionText] = useState("");
  const [solutionImages, setSolutionImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  function showError(message) {
    setToast({ show: true, message, type: "error" });
  }

  useEffect(() => {
    setLoading(true);
    apiFetch("/admin/get-tickets")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTickets(data.tickets);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const selectedTicket = tickets.find((t) => t._id?.toString() === selectedId) || null;

  useEffect(() => {
    if (selectedTicket) {
      setSolutionText(selectedTicket.solution || "");
      setSolutionImages(selectedTicket.solutionImages || []);
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = tickets.filter((t) => (t.status || "ongoing") === statusFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const startIdx = (page - 1) * PER_PAGE;
  const pageData = filtered.slice(startIdx, startIdx + PER_PAGE);

  async function updateTicket(body) {
    setSaving(true);
    try {
      await apiFetch("/admin/update-ticket", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setTickets((prev) =>
        prev.map((t) => (t._id?.toString() === body.id ? { ...t, ...body } : t))
      );
      setSelectedId(null);
    } finally {
      setSaving(false);
    }
  }

  function handleResolve() {
    if (!solutionText.trim()) return;
    updateTicket({
      id: selectedTicket._id.toString(),
      status: "pending",
      solution: solutionText.trim(),
      solutionImages,
    });
  }

  function handleSendBack() {
    updateTicket({
      id: selectedTicket._id.toString(),
      status: "ongoing",
      solution: solutionText,
      solutionImages,
    });
  }

  function handleCloseTicket() {
    updateTicket({
      id: selectedTicket._id.toString(),
      status: "completed",
      solution: solutionText,
      solutionImages,
    });
  }

  const editable = selectedTicket?.status === "ongoing" || !selectedTicket?.status;

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
      <StatusToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      <Head>
        <title>Ticket Management — Linkaro</title>
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
        {/* Page heading */}
        <div className="page-header-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "clamp(16px, 1.8vw, 28px)" }}>
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
            Ticket Management
          </h1>
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            gap: "clamp(8px, 0.8vw, 12px)",
            marginBottom: "clamp(20px, 2.2vw, 32px)",
          }}
        >
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              style={{
                fontFamily: GEIST,
                fontWeight: 400,
                fontSize: "clamp(11px, 0.9vw, 13px)",
                padding: "clamp(7px, 0.65vw, 10px) clamp(14px, 1.3vw, 18px)",
                borderRadius: 8,
                border: "none",
                background: FILTER_BG,
                color: statusFilter === tab.value ? FILTER_ACTIVE : FILTER_INACTIVE,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!selectedTicket ? (
          <>
            {/* Ticket cards grid */}
            {loading ? (
              <p style={{ fontFamily: GEIST, color: "rgba(255,255,255,0.4)" }}>Loading…</p>
            ) : pageData.length === 0 ? (
              <p style={{ fontFamily: GEIST, color: "rgba(255,255,255,0.4)" }}>No tickets found.</p>
            ) : (
              <div className="ticket-grid">
                {pageData.map((t) => (
                  <div
                    key={t._id}
                    style={{
                      background: CARD_BG,
                      borderRadius: 20,
                      padding: "clamp(16px, 1.6vw, 22px)",
                    }}
                  >
                    <div style={{ fontFamily: PP_MORI, fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: "18px", letterSpacing: "0", marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: "#ffffff" }}>Title : </span>
                      <span style={{ fontWeight: 400, color: "#ffffff" }}>{t.title || "—"}</span>
                    </div>
                    <div style={{ fontFamily: PP_MORI, fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: "18px", letterSpacing: "0", marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: "#ffffff" }}>Date : </span>
                      <span style={{ fontWeight: 400, color: "#ffffff" }}>{formatDate(t.createdAt)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontFamily: PP_MORI, fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: "18px", letterSpacing: "0" }}>
                        <span style={{ fontWeight: 600, color: PRIORITY_COLOR }}>Priority : </span>
                        <span style={{ fontWeight: 400, color: PRIORITY_COLOR }}>{t.priority || "High"}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedId(t._id.toString())}
                        style={{
                          width: 114,
                          borderRadius: 140,
                          border: "none",
                          background: ORANGE,
                          color: "#ffffff",
                          fontFamily: GEIST,
                          fontWeight: 400,
                          fontSize: "clamp(11px, 0.9vw, 12px)",
                          lineHeight: "14px",
                          letterSpacing: "0",
                          padding: "clamp(8px, 0.8vw, 10px) 0",
                          cursor: "pointer",
                        }}
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filtered.length > PER_PAGE && (
              <div
                style={{
                  display: "flex", justifyContent: "center", alignItems: "center",
                  gap: "clamp(4px, 0.5vw, 8px)", marginTop: "clamp(20px, 2vw, 28px)",
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
            )}
          </>
        ) : (
          <>
            {/* Ticket detail */}
            <div style={{ background: CARD_BG, borderRadius: 20, padding: "clamp(20px, 2.2vw, 32px)" }}>
              <div style={{ textAlign: "center", marginBottom: "clamp(16px, 1.8vw, 24px)" }}>
                <div style={{ fontFamily: PP_MORI, fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: "18px", letterSpacing: "0", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: "#ffffff" }}>Date : </span>
                  <span style={{ fontWeight: 400, color: "#ffffff" }}>{formatDate(selectedTicket.createdAt)}</span>
                </div>
                <h2
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
                  {selectedTicket.title || "—"}
                </h2>
                <div style={{ fontFamily: PP_MORI, fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: "18px", letterSpacing: "0" }}>
                  <span style={{ fontWeight: 600, color: PRIORITY_COLOR }}>Priority : </span>
                  <span style={{ fontWeight: 400, color: PRIORITY_COLOR }}>{selectedTicket.priority || "High"}</span>
                </div>
              </div>

              {/* Problem */}
              <div style={{ marginBottom: "clamp(20px, 2.2vw, 28px)" }}>
                <div style={{ fontFamily: GEIST, fontWeight: 500, fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: "18px", letterSpacing: "0", color: "#ffffff", marginBottom: 10 }}>
                  Problem
                </div>
                <div
                  style={{
                    width: "100%",
                    minHeight: 230,
                    background: FIELD_BG,
                    borderRadius: 20,
                    padding: "clamp(14px, 1.4vw, 20px)",
                    fontFamily: GEIST,
                    fontSize: "clamp(12px, 1vw, 14px)",
                    color: "rgba(255,255,255,0.85)",
                    boxSizing: "border-box",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedTicket.description || "—"}
                </div>
              </div>

              {/* Problem images */}
              <div style={{ marginBottom: "clamp(24px, 2.6vw, 32px)" }}>
                <div style={{ fontFamily: GEIST, fontWeight: 500, fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: "18px", letterSpacing: "0", color: "#ffffff", marginBottom: 10 }}>
                  Images
                </div>
                <div className="ticket-image-row">
                  {(selectedTicket.images?.length ? selectedTicket.images : [null, null, null]).map((src, i) => (
                    <ImageSlot key={i} src={src} editable={false} onPick={() => {}} onRemove={() => {}} />
                  ))}
                </div>
              </div>

              {/* Solution */}
              <div style={{ marginBottom: "clamp(20px, 2.2vw, 28px)" }}>
                <div style={{ fontFamily: GEIST, fontWeight: 500, fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: "18px", letterSpacing: "0", color: "#ffffff", marginBottom: 10 }}>
                  Solution
                </div>
                {editable ? (
                  <textarea
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    placeholder="Write your text here"
                    style={{
                      width: "100%",
                      height: 230,
                      background: FIELD_BG,
                      borderRadius: 20,
                      border: "none",
                      padding: "clamp(14px, 1.4vw, 20px)",
                      fontFamily: GEIST,
                      fontSize: "clamp(12px, 1vw, 14px)",
                      color: "#ffffff",
                      resize: "none",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      minHeight: 230,
                      background: FIELD_BG,
                      borderRadius: 20,
                      padding: "clamp(14px, 1.4vw, 20px)",
                      fontFamily: GEIST,
                      fontSize: "clamp(12px, 1vw, 14px)",
                      color: "rgba(255,255,255,0.85)",
                      boxSizing: "border-box",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {solutionText || "—"}
                  </div>
                )}
              </div>

              {/* Solution images / Add images */}
              <div>
                <div style={{ fontFamily: GEIST, fontWeight: 500, fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: "18px", letterSpacing: "0", color: "#ffffff", marginBottom: 10 }}>
                  {editable ? "Add images" : "Solution images"}
                </div>
                <div className="ticket-image-row">
                  {[0, 1, 2].map((i) => (
                    <ImageSlot
                      key={i}
                      src={solutionImages[i] || null}
                      editable={editable}
                      onPick={(dataUrl) =>
                        setSolutionImages((prev) => {
                          const next = [...prev];
                          next[i] = dataUrl;
                          return next;
                        })
                      }
                      onRemove={() =>
                        setSolutionImages((prev) => {
                          const next = [...prev];
                          next[i] = null;
                          return next.filter(Boolean);
                        })
                      }
                      onError={showError}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: "clamp(20px, 2.2vw, 28px)" }}>
              {editable && (
                <button
                  type="button"
                  onClick={handleResolve}
                  disabled={saving || !solutionText.trim()}
                  style={{
                    background: ORANGE,
                    border: "none",
                    borderRadius: 140,
                    padding: "clamp(10px, 1vw, 14px) clamp(28px, 2.6vw, 40px)",
                    fontFamily: GEIST,
                    fontWeight: 600,
                    fontSize: "clamp(12px, 1vw, 14px)",
                    color: "#ffffff",
                    cursor: !solutionText.trim() ? "not-allowed" : "pointer",
                    opacity: !solutionText.trim() ? 0.6 : 1,
                  }}
                >
                  Resolve
                </button>
              )}
              {selectedTicket.status === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={handleSendBack}
                    disabled={saving}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: 140,
                      padding: "clamp(10px, 1vw, 14px) clamp(28px, 2.6vw, 40px)",
                      fontFamily: GEIST,
                      fontWeight: 600,
                      fontSize: "clamp(12px, 1vw, 14px)",
                      color: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    Send back
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseTicket}
                    disabled={saving}
                    style={{
                      background: ORANGE,
                      border: "none",
                      borderRadius: 140,
                      padding: "clamp(10px, 1vw, 14px) clamp(28px, 2.6vw, 40px)",
                      fontFamily: GEIST,
                      fontWeight: 600,
                      fontSize: "clamp(12px, 1vw, 14px)",
                      color: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    Close
                  </button>
                </>
              )}
              {selectedTicket.status === "completed" && (
                <button
                  type="button"
                  onClick={handleSendBack}
                  disabled={saving}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: 140,
                    padding: "clamp(10px, 1vw, 14px) clamp(28px, 2.6vw, 40px)",
                    fontFamily: GEIST,
                    fontWeight: 600,
                    fontSize: "clamp(12px, 1vw, 14px)",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  Send back
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 140,
                  padding: "clamp(10px, 1vw, 14px) clamp(28px, 2.6vw, 40px)",
                  fontFamily: GEIST,
                  fontWeight: 600,
                  fontSize: "clamp(12px, 1vw, 14px)",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Back to list
              </button>
            </div>
          </>
        )}
      </main>

      <style>{`
        .ticket-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(14px, 1.4vw, 20px);
        }
        @media (max-width: 1100px) {
          .ticket-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 700px) {
          .ticket-grid { grid-template-columns: 1fr; }
        }
        .ticket-image-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(10px, 1vw, 16px);
        }
        @media (max-width: 600px) {
          .ticket-image-row { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}
