import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import { apiFetch } from "@/lib/api";

const SIDEBAR_W = 260;
const COLLAPSED_W = 56;
const ORANGE = "#FE5900";
const GEIST = "'Geist', sans-serif";
const PP_MORI = "'PP Mori', sans-serif";

const ACTION_META = {
  active: {
    label: "Approve",
    description: "This will mark the subscription as active.",
    confirmLabel: "Yes, Approve",
    confirmBg: ORANGE,
  },
  rejected: {
    label: "Reject",
    description: "This will reject the subscription request.",
    confirmLabel: "Yes, Reject",
    confirmBg: "#B6280C",
  },
  fraud: {
    label: "Mark as Fraud",
    description: "This will flag this subscription as fraudulent.",
    confirmLabel: "Yes, Mark as Fraud",
    confirmBg: "#7B1FA2",
  },
};

function Toast({ toasts }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            pointerEvents: "auto",
            minWidth: 280,
            maxWidth: 360,
            background: t.type === "success"
              ? "linear-gradient(135deg, #0D2B1A 0%, #0A2010 100%)"
              : "linear-gradient(135deg, #2B0D0D 0%, #1A0808 100%)",
            border: `1px solid ${t.type === "success" ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}`,
            borderRadius: 14,
            padding: "14px 18px",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)",
            animation: "toastSlideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: t.type === "success" ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {t.type === "success" ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8.5L6.5 12L13 5" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M5 5L11 11M11 5L5 11" stroke="#F87171" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: GEIST,
                fontWeight: 600,
                fontSize: 13,
                color: t.type === "success" ? "#34D399" : "#F87171",
                marginBottom: 2,
              }}
            >
              {t.type === "success" ? "Success" : "Error"}
            </div>
            <div
              style={{
                fontFamily: GEIST,
                fontWeight: 400,
                fontSize: 12,
                color: "rgba(255,255,255,0.75)",
                lineHeight: "1.5",
              }}
            >
              {t.message}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConfirmModal({ action, onConfirm, onCancel, confirming }) {
  const meta = ACTION_META[action] || {};
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#001140",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: "clamp(24px, 2.5vw, 36px)",
          width: "clamp(300px, 30vw, 420px)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(254,89,0,0.1)",
            border: "1px solid rgba(254,89,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2
          style={{
            fontFamily: PP_MORI,
            fontWeight: 600,
            fontSize: "clamp(16px, 1.4vw, 20px)",
            color: "#ffffff",
            margin: "0 0 8px 0",
            letterSpacing: "-0.02em",
          }}
        >
          Are you sure?
        </h2>
        <p
          style={{
            fontFamily: GEIST,
            fontWeight: 400,
            fontSize: "clamp(12px, 1vw, 14px)",
            color: "rgba(255,255,255,0.55)",
            margin: "0 0 28px 0",
            lineHeight: "1.6",
          }}
        >
          {meta.description} This action can be changed later if needed.
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            style={{
              flex: 1,
              fontFamily: GEIST,
              fontWeight: 400,
              fontSize: "clamp(12px, 1vw, 14px)",
              color: "rgba(255,255,255,0.75)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 50,
              padding: "clamp(10px, 0.9vw, 13px) 0",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            style={{
              flex: 1,
              fontFamily: GEIST,
              fontWeight: 500,
              fontSize: "clamp(12px, 1vw, 14px)",
              color: "#ffffff",
              background: meta.confirmBg || ORANGE,
              border: "none",
              borderRadius: 50,
              padding: "clamp(10px, 0.9vw, 13px) 0",
              cursor: confirming ? "not-allowed" : "pointer",
              opacity: confirming ? 0.7 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {confirming ? "Processing…" : meta.confirmLabel}
          </button>
        </div>
      </div>
    </div>
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

function InfoRow({ label, value }) {
  return (
    <div style={{ marginBottom: "clamp(4px, 0.4vw, 6px)" }}>
      <span
        style={{
          fontFamily: PP_MORI,
          fontWeight: 600,
          fontSize: "clamp(12px, 1.1vw, 16px)",
          lineHeight: "26px",
          letterSpacing: "-0.02em",
          color: "#ffffff",
        }}
      >
        {label}:{" "}
      </span>
      <span
        style={{
          fontFamily: PP_MORI,
          fontWeight: 400,
          fontSize: "clamp(12px, 1.1vw, 16px)",
          lineHeight: "26px",
          letterSpacing: "-0.02em",
          color: "#ffffff",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <h2
      style={{
        fontFamily: GEIST,
        fontWeight: 500,
        fontSize: "clamp(13px, 1.1vw, 16px)",
        lineHeight: "18px",
        letterSpacing: "0",
        color: "#ffffff",
        margin: "0 0 clamp(10px, 1vw, 14px) 0",
      }}
    >
      {children}
    </h2>
  );
}

const btnBase = {
  borderRadius: 50,
  fontFamily: GEIST,
  fontWeight: 400,
  fontSize: "clamp(10px, 0.83vw, 12px)",
  lineHeight: "14px",
  letterSpacing: "0",
  color: "#ffffff",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

let toastCounter = 0;

export default function SubscriptionTicketDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef({});

  function addToast(message, type = "success") {
    const toastId = ++toastCounter;
    setToasts((prev) => [...prev, { id: toastId, message, type }]);
    toastTimers.current[toastId] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
      delete toastTimers.current[toastId];
    }, 4000);
  }

  async function executeUpdate(status) {
    if (updating) return;
    setUpdating(true);
    setConfirmAction(null);
    try {
      const res = await apiFetch("/admin/update-subscription-status", {
        method: "POST",
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setItem((prev) => {
          const isBadge = (prev.subscriptionType || "").toLowerCase().includes("badge");
          const userStatusField = isBadge ? "badgeSubscriptionStatus" : "subscriptionStatus";
          return {
            ...prev,
            user: { ...prev.user, [userStatusField]: status },
          };
        });
        const labels = { active: "approved", rejected: "rejected", fraud: "marked as fraud" };
        addToast(`Subscription ${labels[status] || "updated"} successfully.`, "success");
      } else {
        addToast(data.message || "Failed to update status.", "error");
      }
    } catch {
      addToast("Network error. Please try again.", "error");
    } finally {
      setUpdating(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    apiFetch(`/admin/get-subscription?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setItem(data.subscription);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    return () => {
      Object.values(toastTimers.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Subscription Ticket Details — Linkaro</title>
      </Head>

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>

      <Toast toasts={toasts} />

      {confirmAction && (
        <ConfirmModal
          action={confirmAction}
          confirming={updating}
          onConfirm={() => executeUpdate(confirmAction)}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />

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
        {loading ? (
          <p style={{ fontFamily: GEIST, color: "rgba(255,255,255,0.5)" }}>Loading…</p>
        ) : !item ? (
          <p style={{ fontFamily: GEIST, color: "rgba(255,255,255,0.5)" }}>Ticket not found.</p>
        ) : (
          <>
            {/* Page header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "clamp(14px, 1.4vw, 20px)",
                flexWrap: "wrap",
                gap: "clamp(10px, 1vw, 14px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 1vw, 14px)" }}>
                <button
                  type="button"
                  onClick={() => router.push("/admin/subscription-management")}
                  style={{
                    width: "clamp(32px, 2.5vw, 38px)",
                    height: "clamp(32px, 2.5vw, 38px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(254,89,0,0.15)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 13L5 8L10 3" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
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
                  Subscription Ticket Details
                </h1>
              </div>
              <div style={{ display: "flex", gap: "clamp(8px, 0.8vw, 12px)" }}>
                <button
                  type="button"
                  onClick={() => setConfirmAction("rejected")}
                  disabled={updating}
                  style={{
                    ...btnBase,
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.6)",
                    padding: "clamp(7px, 0.65vw, 10px) clamp(16px, 1.5vw, 24px)",
                    opacity: updating ? 0.6 : 1,
                  }}
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction("active")}
                  disabled={updating}
                  style={{
                    ...btnBase,
                    background: ORANGE,
                    border: "none",
                    padding: "clamp(7px, 0.65vw, 10px) clamp(16px, 1.5vw, 24px)",
                    opacity: updating ? 0.6 : 1,
                  }}
                >
                  Approve
                </button>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: "clamp(16px, 1.6vw, 24px)" }} />

            {/* Two-column grid */}
            <div className="ticket-detail-grid">
              {/* Left: info sections */}
              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "clamp(16px, 1.5vw, 24px)",
                }}
              >
                <SectionHeader>User Information</SectionHeader>
                <InfoRow label="Name" value={item.user?.name || "—"} />
                <InfoRow label="User Type" value={item.user?.role || "—"} />
                <InfoRow label="Service Category" value={item.user?.category || "—"} />
                <InfoRow label="Phone" value={item.user?.phone || "—"} />
                <InfoRow label="Email" value={item.user?.email || "—"} />
                <InfoRow
                  label="Location"
                  value={
                    item.user?.address
                      ? [item.user.address.street, item.user.address.city, item.user.address.zip]
                          .filter(Boolean)
                          .join(", ") || "—"
                      : "—"
                  }
                />

                <div style={{ height: "clamp(14px, 1.3vw, 20px)" }} />

                <SectionHeader>Subscription Info</SectionHeader>
                <InfoRow label="Subscription Plan" value={item.subscriptionType || "—"} />
                <InfoRow label="Amount Paid" value={item.amountPaid || "—"} />
                <InfoRow label="Payment Method" value={item.paymentOption || "—"} />
                <InfoRow label="Date Submitted" value={item.subscriptionDate ? new Date(item.subscriptionDate).toLocaleDateString() : "—"} />
                <InfoRow
                  label="Ticket Status"
                  value={
                    (item.subscriptionType || "").toLowerCase().includes("badge")
                      ? (item.user?.badgeSubscriptionStatus || "—")
                      : (item.user?.subscriptionStatus || "—")
                  }
                />
                <InfoRow label="Priority" value="High" />
              </div>

              {/* Right: Payment Proof */}
              <div
                style={{
                  background: "rgba(255,255,255,0.13)",
                  borderRadius: 12,
                  padding: "clamp(16px, 1.5vw, 24px)",
                }}
              >
                <SectionHeader>Payment Proof</SectionHeader>

                <div
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: 16,
                    padding: "clamp(20px, 2vw, 32px)",
                    marginBottom: "clamp(14px, 1.3vw, 20px)",
                  }}
                >
                  {item.receiptImage ? (
                    <img
                      src={item.receiptImage}
                      alt="Receipt"
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        maxHeight: "320px",
                        borderRadius: 12,
                        display: "block",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        background: "#6F6F6F",
                        borderRadius: 12,
                        aspectRatio: "2 / 1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <img
                        src="/gallery-icon.png"
                        alt="No receipt"
                        style={{ width: 20, height: 18, objectFit: "contain" }}
                      />
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "clamp(8px, 0.8vw, 12px)",
                  }}
                >
                  <a
                    href={item.receiptImage || "#"}
                    download="receipt"
                    style={{
                      ...btnBase,
                      background: item.receiptImage ? ORANGE : "rgba(255,255,255,0.2)",
                      border: "none",
                      padding: "clamp(9px, 0.85vw, 13px) clamp(20px, 2vw, 32px)",
                      textDecoration: "none",
                      display: "inline-block",
                      pointerEvents: item.receiptImage ? "auto" : "none",
                    }}
                  >
                    Download Image
                  </a>
                  {item.receiptImage && (
                    <span
                      onClick={() => window.open(item.receiptImage, "_blank")}
                      style={{
                        fontFamily: GEIST,
                        fontWeight: 400,
                        fontSize: "clamp(10px, 0.83vw, 12px)",
                        lineHeight: "14px",
                        color: "rgba(255,255,255,0.5)",
                        cursor: "pointer",
                      }}
                    >
                      view full size
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom action buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "clamp(8px, 0.8vw, 12px)",
                flexWrap: "wrap",
                marginTop: "clamp(20px, 2vw, 32px)",
              }}
            >
              <button
                type="button"
                onClick={() => setConfirmAction("fraud")}
                disabled={updating}
                style={{
                  ...btnBase,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.6)",
                  padding: "clamp(10px, 0.95vw, 14px) clamp(18px, 1.8vw, 28px)",
                  opacity: updating ? 0.6 : 1,
                }}
              >
                Mark as Fraud
              </button>
              <button
                type="button"
                onClick={() => setConfirmAction("active")}
                disabled={updating}
                style={{
                  ...btnBase,
                  background: ORANGE,
                  border: "none",
                  padding: "clamp(10px, 0.95vw, 14px) clamp(18px, 1.8vw, 28px)",
                  opacity: updating ? 0.6 : 1,
                }}
              >
                Approve &amp; Activate Subscription
              </button>
              <button
                type="button"
                onClick={() => setConfirmAction("rejected")}
                disabled={updating}
                style={{
                  ...btnBase,
                  background: "#B6280C",
                  border: "none",
                  padding: "clamp(10px, 0.95vw, 14px) clamp(18px, 1.8vw, 28px)",
                  opacity: updating ? 0.6 : 1,
                }}
              >
                Reject Ticket
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
