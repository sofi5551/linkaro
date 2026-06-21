import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Sidebar from "@/components/Sidebar";
import { apiFetch } from "@/lib/api";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const SIDEBAR_W = 260;
const COLLAPSED_W = 56;
const ORANGE = "#FE5900";
const BLUE = "#3B82F6";
const LIGHT_BLUE = "#5ED3F3";
const GEIST = "'Geist', sans-serif";
const PP_MORI = "'PP Mori', sans-serif";

// From the production cost estimate (Render + MongoDB Atlas + Cloudinary +
// Brevo + Vercel + stores) — using the top of the "heavy traffic / growing
// fast" tier ($1000–$1500+/month) as the flat monthly expense line. Hosting
// is billed in USD, but subscriptions are priced in PKR, so it's converted
// to PKR (approximate rate) to compare on the same axis as revenue.
const EXPENSES_PER_MONTH_USD = 1500;
const USD_TO_PKR = 280;
const EXPENSES_PER_MONTH_PKR = EXPENSES_PER_MONTH_USD * USD_TO_PKR;

// Fixed plan prices (PKR) — used to recognize revenue per approved
// subscription instead of trusting the manually-entered amountPaid field.
const PLAN_PRICE_PKR = { basic: 1000, badge: 500 };

function isBadgePlan(subscriptionType) {
  return (subscriptionType || "").toLowerCase().includes("badge");
}

function planPricePkr(subscriptionType) {
  return isBadgePlan(subscriptionType) ? PLAN_PRICE_PKR.badge : PLAN_PRICE_PKR.basic;
}

const DEVICE_DATA = [
  { label: "Desktop users", value: 15624, color: ORANGE },
  { label: "Android users", value: 5546, color: BLUE },
  { label: "Apple Users", value: 2478, color: LIGHT_BLUE },
];

const DEVICE_TOTAL = DEVICE_DATA.reduce((sum, d) => sum + d.value, 0);

const RANGE_OPTIONS = [
  { value: "12m", label: "12 months", months: 12 },
  { value: "6m", label: "6 months", months: 6 },
  { value: "3m", label: "3 months", months: 3 },
];

const CARD_DEFS = [
  { key: "totalUsers", label: "Total Users", icon: "/total-users-icon.svg" },
  { key: "serviceProviders", label: "Services Providers", icon: "/service-providers-icon.svg" },
  { key: "consumers", label: "Consumers", icon: "/consumers-icon.svg" },
];

function formatStat(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Last `n` calendar months ending with the current month.
function getLastMonths(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en-US", { month: "short" }),
      fullLabel: d.toLocaleString("en-US", { month: "short", year: "numeric" }),
    });
  }
  return out;
}

// A subscription's effective approval status mirrors the same lookup used on
// the Subscription Management page: the user's current status for that
// subscription type, falling back to the subscription record's own status.
function subscriptionStatus(sub) {
  const isBadge = isBadgePlan(sub.subscriptionType);
  return (
    (isBadge ? sub.user?.badgeSubscriptionStatus : sub.user?.subscriptionStatus) ||
    sub.status ||
    "pending"
  );
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${months[d.getMonth()]} ${d.getDate()}, ${hours}:${minutes} ${ampm}`;
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

function RevenueTooltip({ active, payload, label, data }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const revenue = payload.find((p) => p.dataKey === "revenue")?.value ?? 0;
  const idx = data.findIndex((d) => d.month === label);
  const prev = idx > 0 ? data[idx - 1].revenue : null;
  const pct = prev ? (((revenue - prev) / prev) * 100).toFixed(1) : null;

  return (
    <div
      style={{
        background: "#0D1B3E",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 8,
        padding: "8px 12px",
        fontFamily: GEIST,
        fontSize: 12,
        color: "#ffffff",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontWeight: 600 }}>Rs {(revenue / 1000).toFixed(1)}K</span>
      {pct !== null && (
        <span style={{ color: pct >= 0 ? "#22C55E" : "#FF5A65", marginLeft: 8 }}>
          {pct >= 0 ? "+" : ""}{pct}%
        </span>
      )}
      <div style={{ color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{point?.fullLabel || label}</div>
    </div>
  );
}

function GrowthTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  return (
    <div
      style={{
        background: "#0D1B3E",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 8,
        padding: "8px 12px",
        fontFamily: GEIST,
        fontSize: 12,
        color: "#ffffff",
        whiteSpace: "nowrap",
      }}
    >
      <div><span style={{ color: ORANGE }}>●</span> Consumers: {point.consumer}</div>
      <div><span style={{ color: BLUE }}>●</span> Providers: {point.provider}</div>
      <div style={{ color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{point.fullLabel}</div>
    </div>
  );
}

function RangeDropdown({ value, onChange, data }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const opt = RANGE_OPTIONS.find((o) => o.value === value);
  const slice = data.slice(-opt.months);
  const rangeLabel = slice.length ? `${slice[0].fullLabel} - ${slice[slice.length - 1].fullLabel}` : "—";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8,
          padding: "6px 10px",
          fontFamily: GEIST,
          fontSize: 11,
          color: "rgba(255,255,255,0.7)",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {rangeLabel}
        <svg width="9" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            background: "#0D1B3E",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            zIndex: 30,
            minWidth: 140,
          }}
        >
          {RANGE_OPTIONS.map((o) => (
            <div
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              style={{
                padding: "8px 12px",
                fontFamily: GEIST,
                fontSize: 12,
                color: o.value === value ? ORANGE : "#ffffff",
                cursor: "pointer",
              }}
            >
              Last {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const PAYMENT_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Approved" },
  { value: "pending", label: "Pending" },
];

function PaymentFilterDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = PAYMENT_FILTER_OPTIONS.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8,
          padding: "6px 10px",
          fontFamily: GEIST,
          fontSize: 11,
          color: "rgba(255,255,255,0.7)",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {current.label}
        <svg width="9" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0 }}>
          <path d="M1 1L5 5L9 1" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            background: "#0D1B3E",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            zIndex: 30,
            minWidth: 120,
          }}
        >
          {PAYMENT_FILTER_OPTIONS.map((o) => (
            <div
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              style={{
                padding: "8px 12px",
                fontFamily: GEIST,
                fontSize: 12,
                color: o.value === value ? ORANGE : "#ffffff",
                cursor: "pointer",
                whiteSpace: "nowrap",
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

function DeviceGauge() {
  const width = 220;
  const r = 90;
  const pad = 10;
  const cx = width / 2;
  const cy = r + pad;
  const height = r + pad + 10;

  const polar = (angleDeg) => {
    const rad = (angleDeg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
  };

  // Each device's slice of the half-circle is proportional to its share of
  // the total, drawn as its own solid-color arc picking up where the
  // previous one ended — orange (desktop) -> blue (android) -> light blue (apple).
  let angle = 180;
  const segments = DEVICE_DATA.map((d) => {
    const sweep = (d.value / DEVICE_TOTAL) * 180;
    const start = angle;
    const end = angle - sweep;
    angle = end;
    const [sx, sy] = polar(start);
    const [ex, ey] = polar(end);
    return { ...d, path: `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}` };
  });

  return (
    <div style={{ position: "relative", width, height, margin: "0 auto" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {segments.map((s) => (
          <path
            key={s.label}
            d={s.path}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: pad - 6,
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: PP_MORI, fontWeight: 600, fontSize: "clamp(20px, 1.8vw, 26px)", color: "#ffffff" }}>
          {DEVICE_TOTAL.toLocaleString()}
        </div>
        <div style={{ fontFamily: GEIST, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Users by device</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [range, setRange] = useState("12m");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, serviceProviders: 0, consumers: 0 });
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(true);

  useEffect(() => {
    apiFetch("/admin/get-users")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.users);
          setStats(data.stats);
        }
      })
      .finally(() => setLoadingUsers(false));
  }, []);

  useEffect(() => {
    apiFetch("/admin/get-subscriptions")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSubscriptions(data.subscriptions);
      })
      .finally(() => setLoadingSubs(false));
  }, []);

  const last12 = getLastMonths(12);

  // Revenue — recognized per approved subscription at its fixed plan price
  // (Rs 1000 basic / Rs 500 verify badge), not the manually-entered
  // amountPaid, by month.
  const revenueByMonth = {};
  subscriptions.forEach((sub) => {
    if (subscriptionStatus(sub) !== "active") return;
    const dateVal = sub.subscriptionDate || sub.createdAt;
    if (!dateVal) return;
    const key = monthKey(dateVal);
    revenueByMonth[key] = (revenueByMonth[key] || 0) + planPricePkr(sub.subscriptionType);
  });
  const REVENUE_DATA = last12.map((m) => ({
    month: m.label,
    fullLabel: m.fullLabel,
    revenue: revenueByMonth[m.key] || 0,
    expenses: EXPENSES_PER_MONTH_PKR,
  }));

  // User growth — new consumer vs. provider signups, by month.
  const growthByMonth = {};
  users.forEach((u) => {
    if (!u.createdAt) return;
    const key = monthKey(u.createdAt);
    if (!growthByMonth[key]) growthByMonth[key] = { consumer: 0, provider: 0 };
    if (u.role === "consumer") growthByMonth[key].consumer += 1;
    else if (u.role === "provider") growthByMonth[key].provider += 1;
  });
  const USER_GROWTH_DATA = last12.map((m) => ({
    month: m.label,
    fullLabel: m.fullLabel,
    consumer: growthByMonth[m.key]?.consumer || 0,
    provider: growthByMonth[m.key]?.provider || 0,
  }));

  const rangeMonths = RANGE_OPTIONS.find((o) => o.value === range).months;
  const revenueSlice = REVENUE_DATA.slice(-rangeMonths);
  const currentRevenue = revenueSlice[revenueSlice.length - 1]?.revenue || 0;
  const firstRevenue = revenueSlice[0]?.revenue || 0;
  const revenueGrowth = firstRevenue ? (((currentRevenue - firstRevenue) / firstRevenue) * 100).toFixed(1) : "0.0";

  const totalUsersGrowth = USER_GROWTH_DATA.reduce((sum, d) => sum + d.consumer + d.provider, 0);
  const growthFirst = USER_GROWTH_DATA[0].consumer + USER_GROWTH_DATA[0].provider;
  const growthLast = USER_GROWTH_DATA[USER_GROWTH_DATA.length - 1].consumer + USER_GROWTH_DATA[USER_GROWTH_DATA.length - 1].provider;
  const growthPct = growthFirst ? (((growthLast - growthFirst) / growthFirst) * 100).toFixed(1) : "0.0";

  // Latest subscription purchases first, filtered by approval status.
  const sortedPayments = [...subscriptions].sort(
    (a, b) => new Date(b.subscriptionDate || b.createdAt) - new Date(a.subscriptionDate || a.createdAt)
  );
  const filteredPayments = sortedPayments.filter((sub) => {
    if (paymentFilter === "all") return true;
    return subscriptionStatus(sub) === paymentFilter;
  });

  const cardBoxStyle = {
    background: "rgba(255,255,255,0.13)",
    borderRadius: 20,
    padding: "clamp(14px, 1.3vw, 20px) clamp(16px, 1.5vw, 22px)",
  };

  return (
    <>
      <Head>
        <title>Dashboard — Linkaro</title>
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
                color: "#ffffff",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Export data
            </button>
            <button
              type="button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: ORANGE,
                border: "none",
                borderRadius: 50,
                padding: "clamp(7px, 0.65vw, 10px) clamp(14px, 1.3vw, 20px)",
                fontFamily: GEIST,
                fontWeight: 500,
                fontSize: "clamp(10px, 0.83vw, 12px)",
                color: "#ffffff",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Create report
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="dash-stats-grid" style={{ marginBottom: "clamp(20px, 2vw, 32px)" }}>
          {CARD_DEFS.map((card) => (
            <div key={card.key} style={{ ...cardBoxStyle, display: "flex", flexDirection: "column", gap: "clamp(8px, 0.8vw, 12px)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
                  <span style={{ fontFamily: GEIST, fontWeight: 500, fontSize: "clamp(10px, 0.83vw, 12px)", color: "rgba(255,255,255,0.7)" }}>
                    {card.label}
                  </span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, cursor: "pointer" }}>···</span>
              </div>
              <span style={{ fontFamily: PP_MORI, fontWeight: 600, fontSize: "clamp(18px, 1.67vw, 24px)", color: "#ffffff" }}>
                {loadingUsers ? "—" : formatStat(stats[card.key])}
              </span>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="dash-charts-grid" style={{ marginBottom: "clamp(20px, 2vw, 32px)" }}>
          {/* Revenue chart */}
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "clamp(16px, 1.6vw, 24px)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: GEIST, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                  Current month revenue
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: PP_MORI, fontWeight: 600, fontSize: "clamp(20px, 1.8vw, 26px)", color: "#ffffff" }}>
                    Rs {(currentRevenue / 1000).toFixed(1)}K
                  </span>
                  <span
                    style={{
                      fontFamily: GEIST, fontWeight: 500, fontSize: 12,
                      color: revenueGrowth >= 0 ? "#14CA74" : "#FF5A65",
                      background: revenueGrowth >= 0 ? "#05C16833" : "#FF5A6533",
                      borderRadius: 50, padding: "2px 8px",
                    }}
                  >
                    {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth}%
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 1vw, 16px)", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: GEIST, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: ORANGE, display: "inline-block" }} /> Revenue
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: GEIST, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: BLUE, display: "inline-block" }} /> Expenses
                </span>
                <RangeDropdown value={range} onChange={setRange} data={REVENUE_DATA} />
              </div>
            </div>

            {loadingSubs ? (
              <p style={{ fontFamily: GEIST, color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Loading…</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={revenueSlice} margin={{ top: 10, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BLUE} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} fontFamily={GEIST} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={11}
                    fontFamily={GEIST}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v / 1000}K`}
                  />
                  <Tooltip content={<RevenueTooltip data={revenueSlice} />} />
                  <Area type="monotone" dataKey="expenses" stroke="none" fill="url(#expensesGradient)" />
                  <Line type="monotone" dataKey="revenue" stroke={ORANGE} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: ORANGE }} />
                  <Line type="monotone" dataKey="expenses" stroke={BLUE} strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* User growth chart */}
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "clamp(16px, 1.6vw, 24px)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: GEIST, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                  User Growth
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: PP_MORI, fontWeight: 600, fontSize: "clamp(20px, 1.8vw, 26px)", color: "#ffffff" }}>
                    {formatStat(totalUsersGrowth)}
                  </span>
                  <span
                    style={{
                      fontFamily: GEIST, fontWeight: 500, fontSize: 12,
                      color: growthPct >= 0 ? "#14CA74" : "#FF5A65",
                      background: growthPct >= 0 ? "#05C16833" : "#FF5A6533",
                      borderRadius: 50, padding: "2px 8px",
                    }}
                  >
                    {growthPct >= 0 ? "+" : ""}{growthPct}%
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: GEIST, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: ORANGE, display: "inline-block" }} /> Consumers
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: GEIST, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: BLUE, display: "inline-block" }} /> Providers
                </span>
              </div>
            </div>

            {loadingUsers ? (
              <p style={{ fontFamily: GEIST, color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Loading…</p>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={USER_GROWTH_DATA} margin={{ top: 10, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} fontFamily={GEIST} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip content={<GrowthTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                  <Bar dataKey="consumer" fill={ORANGE} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="provider" fill={BLUE} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <span style={{ fontFamily: GEIST, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Last 12 months</span>
              <button
                type="button"
                style={{ background: "none", border: "none", color: ORANGE, fontFamily: GEIST, fontSize: 11, cursor: "pointer", padding: 0 }}
              >
                View report
              </button>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="dash-bottom-grid">
          {/* Device gauge */}
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "clamp(16px, 1.6vw, 24px)" }}>
            <DeviceGauge />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {DEVICE_DATA.map((d) => (
                <div key={d.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: GEIST, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, display: "inline-block" }} />
                    {d.label}
                  </span>
                  <span style={{ fontFamily: GEIST, fontWeight: 500, fontSize: 13, color: "#ffffff" }}>
                    {d.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment table */}
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden" }}>
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "clamp(12px, 1.1vw, 16px) clamp(14px, 1.4vw, 20px)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span style={{ fontFamily: GEIST, fontWeight: 500, fontSize: 15, color: "#ffffff" }}>Payment</span>
              <PaymentFilterDropdown value={paymentFilter} onChange={setPaymentFilter} />
            </div>

            <div className="table-scroll" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
                <thead>
                  <tr>
                    {["User", "Subscription Type", "Date", "Status", "Total"].map((h) => (
                      <th
                        key={h}
                        style={{
                          fontFamily: GEIST, fontWeight: 400, fontSize: 12,
                          color: "rgba(255,255,255,0.5)", padding: "10px 14px", textAlign: "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingSubs ? (
                    <tr>
                      <td colSpan={5} style={{ fontFamily: GEIST, fontSize: 13, color: "rgba(255,255,255,0.4)", padding: 20, textAlign: "center" }}>
                        Loading…
                      </td>
                    </tr>
                  ) : filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ fontFamily: GEIST, fontSize: 13, color: "rgba(255,255,255,0.4)", padding: 20, textAlign: "center" }}>
                        No subscriptions found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((sub, i) => {
                      const status = subscriptionStatus(sub);
                      const approved = status === "active";
                      const bg = i % 2 === 0 ? "#0A1330" : "transparent";
                      const td = {
                        fontFamily: GEIST, fontSize: 12, color: "#ffffff",
                        padding: "10px 14px", background: bg, whiteSpace: "nowrap",
                      };
                      return (
                        <tr key={sub._id}>
                          <td style={td}>{sub.user?.name || "—"}</td>
                          <td style={td}>{sub.subscriptionType || "—"}</td>
                          <td style={td}>{formatDateTime(sub.subscriptionDate || sub.createdAt)}</td>
                          <td style={td}>
                            <span
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                padding: "3px 10px", borderRadius: 50,
                                background: approved ? "rgba(20,202,116,0.12)" : "rgba(255,184,0,0.12)",
                                color: approved ? "#14CA74" : "#FFB800",
                                fontSize: 11, fontWeight: 500, textTransform: "capitalize",
                              }}
                            >
                              {approved ? "Approved" : status}
                            </span>
                          </td>
                          <td style={td}>Rs {(Number(sub.amountPaid) || 0).toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .dash-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(10px, 1vw, 16px);
        }
        .dash-charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: clamp(14px, 1.4vw, 20px);
        }
        .dash-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: clamp(14px, 1.4vw, 20px);
        }
        @media (max-width: 1100px) {
          .dash-charts-grid { grid-template-columns: 1fr; }
          .dash-bottom-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 700px) {
          .dash-stats-grid { grid-template-columns: 1fr; }
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
