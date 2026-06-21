import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Sidebar from "@/components/Sidebar";
import StatusToast from "@/components/toaster/toast";
import { apiFetch } from "@/lib/api";

const SIDEBAR_W = 260;
const COLLAPSED_W = 56;
const ORANGE = "#FE5900";
const FIELD_BG = "#FFFFFF26";
const GEIST = "'Geist', sans-serif";
const PP_MORI = "'PP Mori', sans-serif";

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "consumer", label: "Consumers" },
  { value: "provider", label: "Service Providers" },
];

function HamburgerLines() {
  return (
    <>
      <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 1 }} />
      <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 1 }} />
      <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 1 }} />
    </>
  );
}

function AudienceSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = AUDIENCE_OPTIONS.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", maxWidth: 365 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: FIELD_BG,
          border: "none",
          borderRadius: 200,
          padding: "clamp(10px, 0.95vw, 13px) clamp(14px, 1.3vw, 18px)",
          fontFamily: GEIST,
          fontWeight: 400,
          fontSize: "clamp(12px, 0.97vw, 14px)",
          color: "#ffffff",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {current.label}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          style={{
            flexShrink: 0,
            marginLeft: 8,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >
          <path d="M1 1L5 5L9 1" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
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
            borderRadius: 10,
            zIndex: 50,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          {AUDIENCE_OPTIONS.map((o) => (
            <div
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              style={{
                padding: "10px 14px",
                fontFamily: GEIST,
                fontSize: "clamp(12px, 0.97vw, 14px)",
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

export default function NotificationManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  async function handleSend() {
    setSending(true);
    try {
      const res = await apiFetch("/admin/send-notification", {
        method: "POST",
        body: JSON.stringify({ message: message.trim(), audience }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send notification");
      }
      setToast({ show: true, message: `Notification sent to ${data.sent} user(s).`, type: "success" });
      setMessage("");
      setAudience("all");
    } catch (err) {
      setToast({ show: true, message: err.message || "Network error. Please try again.", type: "error" });
    } finally {
      setSending(false);
      setConfirmOpen(false);
    }
  }

  const audienceLabel = AUDIENCE_OPTIONS.find((o) => o.value === audience).label;

  return (
    <>
      <StatusToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      <Head>
        <title>Notification Management — Linkaro</title>
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
        <div className="page-header-row" style={{ marginBottom: "clamp(20px, 2.2vw, 32px)" }}>
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
            Notification Management
          </h1>
        </div>

        {/* Form card */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: "clamp(20px, 2.2vw, 32px)",
            maxWidth: 640,
          }}
        >
          {/* Description */}
          <div style={{ marginBottom: "clamp(20px, 2.2vw, 28px)" }}>
            <div
              style={{
                fontFamily: GEIST, fontWeight: 500, fontSize: "clamp(14px, 1.1vw, 16px)",
                lineHeight: "18px", letterSpacing: "0", color: "#ffffff", marginBottom: 10,
              }}
            >
              Description
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
          </div>

          {/* Select users */}
          <div style={{ marginBottom: "clamp(20px, 2.2vw, 28px)" }}>
            <div
              style={{
                fontFamily: GEIST, fontWeight: 500, fontSize: "clamp(14px, 1.1vw, 16px)",
                lineHeight: "18px", letterSpacing: "0", color: "#ffffff", marginBottom: 10,
              }}
            >
              Select Users
            </div>
            <AudienceSelect value={audience} onChange={setAudience} />
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={!message.trim()}
            style={{
              background: ORANGE,
              border: "none",
              borderRadius: 140,
              padding: "clamp(12px, 1.1vw, 16px) clamp(32px, 3vw, 48px)",
              fontFamily: GEIST,
              fontWeight: 600,
              fontSize: "clamp(13px, 1.18vw, 17px)",
              lineHeight: "0.9",
              letterSpacing: "-0.03em",
              color: "#ffffff",
              cursor: message.trim() ? "pointer" : "not-allowed",
              opacity: message.trim() ? 1 : 0.6,
            }}
          >
            Send Notification
          </button>
        </div>
      </main>

      {/* Confirm modal */}
      {confirmOpen && (
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
                background: "#FE590020",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <img
                src="/notifcation-icon.svg"
                alt=""
                style={{
                  width: 22,
                  height: 22,
                  filter: "brightness(0) saturate(100%) invert(54%) sepia(86%) saturate(2700%) hue-rotate(0deg)",
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
              This notification will be sent to <strong style={{ color: "#ffffff" }}>{audienceLabel}</strong>.
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={sending}
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
                onClick={handleSend}
                disabled={sending}
                style={{
                  fontFamily: GEIST,
                  fontWeight: 400,
                  fontSize: "clamp(11px, 0.9vw, 13px)",
                  padding: "clamp(9px, 0.85vw, 12px) clamp(20px, 2vw, 32px)",
                  borderRadius: 50,
                  background: ORANGE,
                  border: "none",
                  color: "#ffffff",
                  cursor: sending ? "not-allowed" : "pointer",
                  opacity: sending ? 0.7 : 1,
                }}
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
