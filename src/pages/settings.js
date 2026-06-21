import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Sidebar from "@/components/Sidebar";

const SIDEBAR_W = 260;
const COLLAPSED_W = 56;
const ORANGE = "#FE5900";
const MUTED = "#AEB9E1";
const FIELD_BG = "#FFFFFF26";
const DIVIDER_V = "#FFFFFF3D";
const DIVIDER_H = "#FFFFFF24";
const GEIST = "'Geist', sans-serif";
const PP_MORI = "'PP Mori', sans-serif";

function HamburgerLines() {
  return (
    <>
      <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 1 }} />
      <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 1 }} />
      <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 1 }} />
    </>
  );
}

function ToggleSwitch({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      aria-label="Toggle"
      style={{
        width: "clamp(32px, 2.5vw, 38px)",
        height: "clamp(18px, 1.4vw, 21px)",
        background: on ? ORANGE : "#555555",
        borderRadius: 100,
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          left: on ? "calc(100% - clamp(19px, 1.5vw, 22px))" : "2px",
          width: "clamp(14px, 1.1vw, 17px)",
          height: "clamp(14px, 1.1vw, 17px)",
          background: "#ffffff",
          borderRadius: "50%",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

function SettingsSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          fontSize: "clamp(11px, 0.9vw, 12px)",
          color: "#ffffff",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value}
        </span>
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
            maxHeight: 220,
            overflowY: "auto",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          {options.map((o) => (
            <div
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              style={{
                padding: "9px 14px",
                fontFamily: GEIST,
                fontSize: "clamp(11px, 0.9vw, 12px)",
                color: o === value ? ORANGE : "#ffffff",
                background: o === value ? "rgba(254,89,0,0.1)" : "transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, className, children }) {
  return (
    <div className={className} style={{ width: "100%", maxWidth: 365 }}>
      <label
        style={{
          display: "block",
          fontFamily: GEIST,
          fontWeight: 400,
          fontSize: "clamp(10px, 0.83vw, 12px)",
          lineHeight: "14px",
          letterSpacing: "0",
          color: MUTED,
          marginBottom: "clamp(6px, 0.6vw, 8px)",
          textAlign: "left",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleField({ label, description, className, on, onChange }) {
  return (
    <Field label={label} className={className}>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: FIELD_BG,
          borderRadius: 200,
          padding: "clamp(8px, 0.8vw, 11px) clamp(14px, 1.3vw, 18px)",
        }}
      >
        <span
          style={{
            fontFamily: GEIST,
            fontWeight: 400,
            fontSize: "clamp(11px, 0.9vw, 12px)",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {description}
        </span>
        <ToggleSwitch on={on} onChange={onChange} />
      </div>
    </Field>
  );
}

export default function SystemSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [language, setLanguage] = useState("English");
  const [adminTheme, setAdminTheme] = useState("Light");
  const [timeZone, setTimeZone] = useState("CET - Central European Time");
  const [currency, setCurrency] = useState("USD ($)");
  const [systemFont, setSystemFont] = useState("Default - Hanken Grotesk");

  const [allowSignup, setAllowSignup] = useState(true);
  const [userTheme, setUserTheme] = useState("Light");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [notifications, setNotifications] = useState(true);
  const [dashboardLayout, setDashboardLayout] = useState("Default - Spacious");

  return (
    <>
      <Head>
        <title>System Settings — Linkaro</title>
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
        {/* Topbar */}
        <div
          className="settings-topbar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(10px, 1vw, 14px)",
            marginBottom: "clamp(16px, 1.8vw, 24px)",
          }}
        >
          <img
            src="/profile-image.png"
            alt=""
            style={{ width: 61, height: 61, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
          <div style={{ width: 1, height: 28, background: DIVIDER_V, flexShrink: 0 }} />
          <span
            style={{
              fontFamily: PP_MORI,
              fontWeight: 600,
              fontSize: "clamp(12px, 1.04vw, 14px)",
              lineHeight: "23px",
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            John Doe
          </span>
        </div>

        {/* Horizontal divider */}
        <div style={{ height: 1, background: DIVIDER_H, marginBottom: "clamp(20px, 2.2vw, 32px)" }} />

        {/* Page heading */}
        <div style={{ marginBottom: "clamp(20px, 2.2vw, 32px)" }}>
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
            System Settings
          </h1>
          <p
            style={{
              fontFamily: GEIST,
              fontWeight: 400,
              fontSize: "clamp(12px, 0.97vw, 14px)",
              lineHeight: "14px",
              letterSpacing: "0",
              color: MUTED,
              margin: 0,
            }}
          >
            Setup and edit system settings and preferences
          </p>
        </div>

        {/* General settings box */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: "clamp(20px, 2.2vw, 32px)",
          }}
        >
          <div className="settings-columns">
            <h2
              className="gs-heading"
              style={{
                width: "100%",
                maxWidth: 365,
                fontFamily: GEIST,
                fontWeight: 500,
                fontSize: "clamp(14px, 1.1vw, 16px)",
                lineHeight: "18px",
                letterSpacing: "0",
                color: "#ffffff",
                textAlign: "left",
                margin: 0,
              }}
            >
              General
            </h2>

            <div className="settings-divider gs-divider" />

            <Field className="gs-l1" label="System Language">
              <SettingsSelect
                value={language}
                onChange={setLanguage}
                options={["English", "Urdu", "Arabic", "French"]}
              />
            </Field>
            <Field className="gs-l2" label="Admin dashboard theme">
              <SettingsSelect
                value={adminTheme}
                onChange={setAdminTheme}
                options={["Light", "Dark"]}
              />
            </Field>
            <Field className="gs-l3" label="Time Zone">
              <SettingsSelect
                value={timeZone}
                onChange={setTimeZone}
                options={["CET - Central European Time", "PKT - Pakistan Standard Time", "GMT - Greenwich Mean Time", "EST - Eastern Standard Time"]}
              />
            </Field>
            <Field className="gs-l4" label="Currency">
              <SettingsSelect
                value={currency}
                onChange={setCurrency}
                options={["USD ($)", "EUR (€)", "GBP (£)", "PKR (Rs)"]}
              />
            </Field>
            <Field className="gs-l5" label="System Font">
              <SettingsSelect
                value={systemFont}
                onChange={setSystemFont}
                options={["Default - Hanken Grotesk", "Geist", "Inter", "Roboto"]}
              />
            </Field>

            <ToggleField
              className="gs-r1"
              label="User Sign up"
              description="Allow new users to sign up"
              on={allowSignup}
              onChange={setAllowSignup}
            />
            <Field className="gs-r2" label="Default Theme for Users">
              <SettingsSelect
                value={userTheme}
                onChange={setUserTheme}
                options={["Light", "Dark"]}
              />
            </Field>
            <Field className="gs-r3" label="Date and Time Format">
              <SettingsSelect
                value={dateFormat}
                onChange={setDateFormat}
                options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}
              />
            </Field>
            <ToggleField
              className="gs-r4"
              label="Notifications"
              description="Allow system notifications"
              on={notifications}
              onChange={setNotifications}
            />
            <Field className="gs-r5" label="Admin Dashboard Layout">
              <SettingsSelect
                value={dashboardLayout}
                onChange={setDashboardLayout}
                options={["Default - Spacious", "Compact"]}
              />
            </Field>

            {/* Save button — right edge lines up with where the fields end */}
            <div
              className="gs-save"
              style={{
                width: "100%",
                maxWidth: 365,
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "clamp(28px, 3vw, 44px)",
              }}
            >
              <button
                type="button"
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
                  cursor: "pointer",
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .settings-columns {
          display: grid;
          grid-template-columns: 1fr 1px 1fr;
          column-gap: clamp(20px, 2.5vw, 40px);
          row-gap: clamp(14px, 1.4vw, 20px);
          align-items: stretch;
          justify-items: center;
        }
        .gs-heading { grid-column: 1; grid-row: 1; }
        .gs-divider { grid-column: 2; grid-row: 2 / 7; }
        .gs-l1 { grid-column: 1; grid-row: 2; }
        .gs-l2 { grid-column: 1; grid-row: 3; }
        .gs-l3 { grid-column: 1; grid-row: 4; }
        .gs-l4 { grid-column: 1; grid-row: 5; }
        .gs-l5 { grid-column: 1; grid-row: 6; }
        .gs-r1 { grid-column: 3; grid-row: 2; }
        .gs-r2 { grid-column: 3; grid-row: 3; }
        .gs-r3 { grid-column: 3; grid-row: 4; }
        .gs-r4 { grid-column: 3; grid-row: 5; }
        .gs-r5 { grid-column: 3; grid-row: 6; }
        .gs-save { grid-column: 3; grid-row: 7; }
        .settings-divider {
          width: 1px;
          background: ${DIVIDER_V};
        }
        @media (max-width: 700px) {
          .settings-columns {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: clamp(16px, 2vw, 24px);
          }
          .settings-divider {
            display: none;
          }
          .gs-save {
            justify-content: center;
          }
        }
        @media (max-width: 768px) {
          .settings-topbar {
            margin-top: 40px;
          }
        }
      `}</style>
    </>
  );
}
