import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";

const PROVIDER_CATEGORIES = [
  "Computer Repair",
  "Laptop Repair",
  "Printer Repair",
  "Mobile Phone Repair",
  "Network Technician",
  "System Technician",
  "Technical Support",
  "Software Installation",
  "Data Recovery Service",
  "Website Developer",
  "Graphic Designer",
  "CCTV Camera Installation & Repair",
  "Mechanic",
  "Tire Repair / Puncture Service",
  "Electrician",
  "Plumber",
  "AC Repair & Installation",
  "Refrigerator Repair",
  "Washing Machine Repair",
  "Geyser / Water Heater Repair",
  "Generator Repair",
  "UPS / Inverter Repair",
  "Solar Panel Technician",
  "Carpenter",
  "Mason / Construction Worker",
  "Painter",
  "Welder",
  "Glass & Aluminum Work",
  "Rooftop Waterproofing",
  "Home Cleaner",
  "Gardener / Mali",
  "Labor / Mazdoor",
  "Barber",
  "Beautician",
  "Makeup Artist",
  "Hair Stylist",
  "Tailor",
  "Home Food Service",
  "Lunch Box Service",
  "Catering Service",
  "Home Baker",
  "Car Wash Service",
  "Bike Mechanic",
  "Car Towing Service",
  "Photographer",
  "Videographer",
  "Drone Camera Service",
  "Event Decorator",
  "DJ & Sound System Service",
  "Fitness Trainer",
];

const SIDEBAR_W = 260;
const COLLAPSED_W = 56;
const ORANGE = "#FE5900";
const GEIST = "'Geist', sans-serif";
const PP_MORI = "'PP Mori', sans-serif";

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

function formatPhone(phone) {
  if (!phone) return "—";
  if (phone.startsWith("+92")) return `+92 | ${phone.slice(3)}`;
  return phone;
}

function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const display = value || "— Select —";

  return (
    <div ref={ref} style={{ flex: 1, position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 6,
          padding: "6px 10px",
          fontFamily: GEIST,
          fontSize: "clamp(10px, 0.83vw, 13px)",
          color: value ? "#ffffff" : "rgba(255,255,255,0.35)",
          cursor: "pointer",
          textAlign: "left",
          outline: "none",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {display}
        </span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          style={{
            flexShrink: 0,
            marginLeft: 6,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
            borderRadius: 8,
            zIndex: 50,
            maxHeight: 220,
            overflowY: "auto",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.15) transparent",
          }}
        >
          <div
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            style={{
              padding: "8px 12px",
              fontFamily: GEIST,
              fontSize: "clamp(10px, 0.83vw, 13px)",
              color: "rgba(255,255,255,0.35)",
              cursor: "pointer",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            — Select —
          </div>
          {options.map((o) => (
            <div
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              style={{
                padding: "8px 12px",
                fontFamily: GEIST,
                fontSize: "clamp(10px, 0.83vw, 13px)",
                color: o === value ? ORANGE : "#ffffff",
                background: o === value ? "rgba(254,89,0,0.1)" : "transparent",
                cursor: "pointer",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => {
                if (o !== value)
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  o === value ? "rgba(254,89,0,0.1)" : "transparent";
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
        padding: "4px 12px",
        borderRadius: 50,
        whiteSpace: "nowrap",
        textTransform: "capitalize",
      }}
    >
      {label || "—"}
    </span>
  );
}

function InfoRow({
  label,
  value,
  editMode,
  inputValue,
  onChange,
  type = "text",
  options,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: editMode ? "center" : "baseline",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "clamp(10px, 1vw, 14px) 0",
        gap: "clamp(12px, 1.2vw, 20px)",
      }}
    >
      <span
        style={{
          fontFamily: GEIST,
          fontWeight: 400,
          fontSize: "clamp(10px, 0.83vw, 12px)",
          lineHeight: "100%",
          color: "rgba(255,255,255,0.55)",
          flexShrink: 0,
          width: "clamp(100px, 12vw, 150px)",
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: 1,
          height: 14,
          background: "rgba(255,255,255,0.15)",
          flexShrink: 0,
        }}
      />
      {editMode && options ? (
        <CustomSelect
          value={inputValue}
          onChange={onChange}
          options={options}
        />
      ) : editMode ? (
        <input
          type={type}
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 6,
            padding: "6px 10px",
            fontFamily: GEIST,
            fontSize: "clamp(10px, 0.83vw, 13px)",
            color: "#ffffff",
            outline: "none",
          }}
        />
      ) : (
        <span
          style={{
            fontFamily: GEIST,
            fontWeight: 400,
            fontSize: "clamp(10px, 0.83vw, 13px)",
            lineHeight: "24px",
            color: "#8E8E8E",
            flex: 1,
          }}
        >
          {value || "—"}
        </span>
      )}
    </div>
  );
}

function CnicImageBox({ label, src, editMode, onChange }) {
  const ref = useRef();
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          fontFamily: GEIST,
          fontWeight: 400,
          fontSize: "clamp(10px, 0.83vw, 12px)",
          color: "rgba(255,255,255,0.55)",
          margin: "0 0 8px 0",
        }}
      >
        {label}
      </p>
      <div
        style={{
          position: "relative",
          borderRadius: 10,
          overflow: "hidden",
          background: "rgba(255,255,255,0.08)",
          aspectRatio: "16/9",
        }}
      >
        {src ? (
          <img
            src={src}
            alt={label}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.3)",
              fontFamily: GEIST,
              fontSize: "clamp(9px, 0.7vw, 11px)",
            }}
          >
            No image
          </div>
        )}
        {editMode && (
          <>
            <button
              type="button"
              onClick={() => ref.current.click()}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontFamily: GEIST,
                fontSize: "clamp(9px, 0.7vw, 11px)",
              }}
            >
              Click to change
            </button>
            <input
              ref={ref}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => onChange(reader.result);
                reader.readAsDataURL(file);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function UserDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [saveModal, setSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [regStatusConfirm, setRegStatusConfirm] = useState(false);
  const profileInputRef = useRef();

  async function confirmToggleRegistrationStatus() {
    if (statusUpdating || !user) return;
    const newStatus = user.registrationStatus !== true;
    setStatusUpdating(true);
    setRegStatusConfirm(false);
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, registrationStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => ({ ...prev, registrationStatus: newStatus }));
        setForm((prev) => ({ ...prev, registrationStatus: newStatus ? "verified" : "unverified" }));
      }
    } finally {
      setStatusUpdating(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/get-user?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          initForm(data.user);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  function initForm(u) {
    setForm({
      name: u.name || "",
      phone: u.phone || "",
      gender: u.gender || "",
      cnic: u.cnic || "",
      street: u.address?.street || "",
      city: u.address?.city || "",
      zip: u.address?.zip || "",
      category: u.category || "",
      profileImage: u.profileImage || "",
      cnicFrontImage: u.cnicFrontImage || "",
      cnicBackImage: u.cnicBackImage || "",
      registrationStatus: u.registrationStatus === true ? "verified" : u.registrationStatus === false ? "unverified" : "",
    });
  }

  function cancelEdit() {
    initForm(user);
    setEditMode(false);
  }

  async function confirmSave() {
    setSaving(true);
    try {
      const regStatus = form.registrationStatus === "verified" ? true : form.registrationStatus === "unverified" ? false : undefined;
      const payload = { id, ...form, registrationStatus: regStatus };
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => ({
          ...prev,
          name: form.name || prev.name,
          phone: form.phone || prev.phone,
          gender: form.gender,
          cnic: form.cnic,
          address: { street: form.street, city: form.city, zip: form.zip },
          category: form.category,
          profileImage: form.profileImage || prev.profileImage,
          cnicFrontImage: form.cnicFrontImage || prev.cnicFrontImage,
          cnicBackImage: form.cnicBackImage || prev.cnicBackImage,
          registrationStatus: form.registrationStatus === "verified" ? true : false,
        }));
        setEditMode(false);
      }
    } finally {
      setSaving(false);
      setSaveModal(false);
    }
  }

  const f = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const isProvider = user?.role === "provider";

  return (
    <>
      <Head>
        <title>User Details — Linkaro</title>
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
        {loading ? (
          <p style={{ fontFamily: GEIST, color: "rgba(255,255,255,0.4)" }}>
            Loading…
          </p>
        ) : !user ? (
          <p style={{ fontFamily: GEIST, color: "rgba(255,255,255,0.4)" }}>
            User not found.
          </p>
        ) : (
          <>
            {/* Page header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: "clamp(20px, 2vw, 32px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 1vw, 14px)" }}>
                <button
                  type="button"
                  onClick={() => router.push("/admin/user-management")}
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
                <div>
                  <h1 style={{
                    fontFamily: GEIST, fontWeight: 500,
                    fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: "18px",
                    letterSpacing: "0", color: "#ffffff", margin: "0 0 5px 0",
                  }}>
                    Personal information
                  </h1>
                  <p style={{
                    fontFamily: GEIST, fontWeight: 400,
                    fontSize: "clamp(12px, 0.97vw, 14px)", lineHeight: "14px",
                    letterSpacing: "0", color: "#AEB9E1", margin: 0,
                  }}>
                    View and manage user profile details.
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {editMode && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    style={{
                      fontFamily: GEIST,
                      fontWeight: 400,
                      fontSize: "clamp(10px, 0.83vw, 12px)",
                      lineHeight: "14px",
                      padding:
                        "clamp(7px, 0.65vw, 10px) clamp(14px, 1.3vw, 20px)",
                      borderRadius: 4,
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.25)",
                      color: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    editMode ? setSaveModal(true) : setEditMode(true)
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: GEIST,
                    fontWeight: 400,
                    fontSize: "clamp(10px, 0.83vw, 12px)",
                    lineHeight: "14px",
                    padding:
                      "clamp(7px, 0.65vw, 10px) clamp(14px, 1.3vw, 20px)",
                    borderRadius: 4,
                    background: editMode ? ORANGE : "rgba(254, 89, 0, 0.15)",
                    border: "none",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  {editMode ? "Save" : "Edit Info"}
                  <img
                    src="/profile-edit-pencil-icon.png"
                    alt=""
                    style={{
                      width: 13,
                      height: 13,
                      filter: "brightness(0) invert(1)",
                      opacity: editMode ? 0 : 1,
                      position: editMode ? "absolute" : "static",
                      pointerEvents: "none",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Main card */}
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "clamp(20px, 2vw, 32px)",
              }}
            >
              {/* Profile section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(14px, 1.4vw, 20px)",
                  marginBottom: "clamp(20px, 2vw, 32px)",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img
                    src={
                      editMode
                        ? form.profileImage || "/dummy-profile-image.jpg"
                        : user.profileImage || "/dummy-profile-image.jpg"
                    }
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    style={{
                      width: "clamp(80px, 7.8vw, 112px)",
                      height: "clamp(80px, 7.8vw, 112px)",
                      borderRadius: "50%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.target.src = "/dummy-profile-image.jpg";
                    }}
                  />
                  {editMode && (
                    <>
                      <button
                        type="button"
                        onClick={() => profileInputRef.current.click()}
                        style={{
                          position: "absolute",
                          bottom: 4,
                          right: 4,
                          width: "clamp(22px, 2vw, 28px)",
                          height: "clamp(22px, 2vw, 28px)",
                          borderRadius: "50%",
                          background: ORANGE,
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src="/profile-edit-pencil-icon.png"
                          alt="Edit"
                          style={{
                            width: 11,
                            height: 11,
                            filter: "brightness(0) invert(1)",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </button>
                      <input
                        ref={profileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () =>
                            setForm((prev) => ({
                              ...prev,
                              profileImage: reader.result,
                            }));
                          reader.readAsDataURL(file);
                        }}
                      />
                    </>
                  )}
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: PP_MORI,
                      fontWeight: 600,
                      fontSize: "clamp(18px, 1.67vw, 24px)",
                      lineHeight: "29px",
                      letterSpacing: "-0.02em",
                      color: "#ffffff",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {user.name || "—"}
                  </h2>
                  <p
                    style={{
                      fontFamily: GEIST,
                      fontWeight: 400,
                      fontSize: "clamp(12px, 1.04vw, 15px)",
                      lineHeight: "14px",
                      letterSpacing: "0",
                      color: "#ABABAB",
                      margin: 0,
                    }}
                  >
                    {user.email || "—"}
                  </p>
                </div>
              </div>

              {/* Info rows */}
              <InfoRow
                label="Name"
                value={user.name}
                editMode={editMode}
                inputValue={form.name}
                onChange={f("name")}
              />
              <InfoRow
                label="Phone Number"
                value={formatPhone(user.phone)}
                editMode={editMode}
                inputValue={form.phone}
                onChange={f("phone")}
                type="tel"
              />
              <InfoRow
                label="Address"
                value={user.address?.street}
                editMode={editMode}
                inputValue={form.street}
                onChange={f("street")}
              />
              <InfoRow
                label="City"
                value={user.address?.city}
                editMode={editMode}
                inputValue={form.city}
                onChange={f("city")}
              />
              <InfoRow
                label="Postal Code"
                value={user.address?.zip}
                editMode={editMode}
                inputValue={form.zip}
                onChange={f("zip")}
              />
              <InfoRow
                label="CNIC"
                value={user.cnic}
                editMode={editMode}
                inputValue={form.cnic}
                onChange={f("cnic")}
              />
              <InfoRow
                label="Gender"
                value={user.gender}
                editMode={editMode}
                inputValue={form.gender}
                onChange={f("gender")}
                options={["Male", "Female", "Other"]}
              />
              {/* Registration Status — provider only */}
              {isProvider && <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  padding: "clamp(10px, 1vw, 14px) 0",
                  gap: "clamp(12px, 1.2vw, 20px)",
                }}
              >
                <span
                  style={{
                    fontFamily: GEIST,
                    fontWeight: 400,
                    fontSize: "clamp(10px, 0.83vw, 12px)",
                    lineHeight: "100%",
                    color: "rgba(255,255,255,0.55)",
                    flexShrink: 0,
                    width: "clamp(100px, 12vw, 150px)",
                  }}
                >
                  Registration Status
                </span>
                <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                {editMode ? (
                  <CustomSelect
                    value={form.registrationStatus}
                    onChange={f("registrationStatus")}
                    options={["verified", "unverified"]}
                  />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, flexWrap: "wrap", gap: 10 }}>
                    <StatusBadge status={user.registrationStatus} />
                    <button
                      type="button"
                      onClick={() => setRegStatusConfirm(true)}
                      disabled={statusUpdating}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontFamily: GEIST,
                        fontWeight: 500,
                        fontSize: "clamp(10px, 0.83vw, 12px)",
                        padding: "clamp(6px, 0.55vw, 8px) clamp(12px, 1.1vw, 16px)",
                        borderRadius: 8,
                        border: `1px solid ${user.registrationStatus === true ? "rgba(255,90,101,0.3)" : "rgba(20,202,116,0.3)"}`,
                        background: user.registrationStatus === true ? "rgba(255,90,101,0.08)" : "rgba(20,202,116,0.08)",
                        color: user.registrationStatus === true ? "#FF5A65" : "#14CA74",
                        cursor: statusUpdating ? "not-allowed" : "pointer",
                        opacity: statusUpdating ? 0.6 : 1,
                        whiteSpace: "nowrap",
                        transition: "background 0.15s, opacity 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!statusUpdating) e.currentTarget.style.background = user.registrationStatus === true ? "rgba(255,90,101,0.16)" : "rgba(20,202,116,0.16)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = user.registrationStatus === true ? "rgba(255,90,101,0.08)" : "rgba(20,202,116,0.08)";
                      }}
                    >
                      {/* shield icon */}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        {user.registrationStatus === true
                          ? <path d="M6 1L1 3v3c0 2.76 2.14 5.34 5 6 2.86-.66 5-3.24 5-6V3L6 1zm-1 7L3.5 6.5l.7-.7L5 6.8l2.8-2.8.7.7L5 8z" fill="#FF5A65"/>
                          : <path d="M6 1L1 3v3c0 2.76 2.14 5.34 5 6 2.86-.66 5-3.24 5-6V3L6 1zm-1 7L3.5 6.5l.7-.7L5 6.8l2.8-2.8.7.7L5 8z" fill="#14CA74"/>
                        }
                      </svg>
                      {statusUpdating ? "Updating…" : user.registrationStatus === true ? "Revoke Verification" : "Mark as Verified"}
                    </button>
                  </div>
                )}
              </div>}
              {isProvider && (
                <InfoRow
                  label="Category"
                  value={user.category}
                  editMode={editMode}
                  inputValue={form.category}
                  onChange={f("category")}
                  options={PROVIDER_CATEGORIES}
                />
              )}

              {/* CNIC images — provider only */}
              {isProvider && (
                <div style={{ marginTop: "clamp(16px, 1.5vw, 24px)" }}>
                  <p
                    style={{
                      fontFamily: GEIST,
                      fontWeight: 500,
                      fontSize: "clamp(10px, 0.83vw, 12px)",
                      color: "rgba(255,255,255,0.55)",
                      margin: "0 0 clamp(10px, 1vw, 14px) 0",
                    }}
                  >
                    CNIC Images
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "clamp(10px, 1vw, 16px)",
                      flexWrap: "wrap",
                    }}
                  >
                    <CnicImageBox
                      label="Front"
                      src={editMode ? form.cnicFrontImage : user.cnicFrontImage}
                      editMode={editMode}
                      onChange={f("cnicFrontImage")}
                    />
                    <CnicImageBox
                      label="Back"
                      src={editMode ? form.cnicBackImage : user.cnicBackImage}
                      editMode={editMode}
                      onChange={f("cnicBackImage")}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Registration status confirmation modal */}
      {regStatusConfirm && (
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
          onClick={() => setRegStatusConfirm(false)}
        >
          <div
            style={{
              background: "#001140",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 20,
              padding: "clamp(24px, 2.5vw, 36px)",
              width: "clamp(300px, 30vw, 420px)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: user?.registrationStatus === true ? "rgba(255,90,101,0.1)" : "rgba(20,202,116,0.1)",
                border: `1px solid ${user?.registrationStatus === true ? "rgba(255,90,101,0.25)" : "rgba(20,202,116,0.25)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke={user?.registrationStatus === true ? "#FF5A65" : "#14CA74"}
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                {user?.registrationStatus === true
                  ? <path d="M15 9l-6 6M9 9l6 6" stroke="#FF5A65" strokeWidth="1.8" strokeLinecap="round"/>
                  : <path d="M9 12l2 2 4-4" stroke="#14CA74" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                }
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
              {user?.registrationStatus === true ? "Revoke Verification?" : "Verify this provider?"}
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
              {user?.registrationStatus === true
                ? `This will mark ${user?.name || "this provider"}'s registration as unverified. They may lose access to verified features.`
                : `This will mark ${user?.name || "this provider"} as a verified provider. This grants them full access to verified features.`
              }
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setRegStatusConfirm(false)}
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
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmToggleRegistrationStatus}
                style={{
                  flex: 1,
                  fontFamily: GEIST,
                  fontWeight: 500,
                  fontSize: "clamp(12px, 1vw, 14px)",
                  color: "#ffffff",
                  background: user?.registrationStatus === true ? "#FF5A65" : "#14CA74",
                  border: "none",
                  borderRadius: 50,
                  padding: "clamp(10px, 0.9vw, 13px) 0",
                  cursor: "pointer",
                }}
              >
                {user?.registrationStatus === true ? "Yes, Revoke" : "Yes, Verify"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save confirmation modal */}
      {saveModal && (
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
            <h3
              style={{
                fontFamily: PP_MORI,
                fontWeight: 600,
                fontSize: "clamp(16px, 1.4vw, 20px)",
                color: "#ffffff",
                margin: "0 0 10px 0",
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
                lineHeight: 1.5,
              }}
            >
              This will update the user&apos;s profile information.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setSaveModal(false)}
                disabled={saving}
                style={{
                  fontFamily: GEIST,
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
                onClick={confirmSave}
                disabled={saving}
                style={{
                  fontFamily: GEIST,
                  fontSize: "clamp(11px, 0.9vw, 13px)",
                  padding: "clamp(9px, 0.85vw, 12px) clamp(20px, 2vw, 32px)",
                  borderRadius: 50,
                  background: ORANGE,
                  border: "none",
                  color: "#ffffff",
                  cursor: "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
