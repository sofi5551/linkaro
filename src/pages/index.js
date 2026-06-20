import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import StatusToast from "@/components/toaster/toast";
import { apiFetch } from "@/lib/api";

const ORANGE = "#FE5900";
const INPUT_BG = "#4D4D4D";
const ERROR_COLOR = "#FF4D4D";

const GEIST = "'Geist', sans-serif";
const PP_MORI = "'PP Mori', sans-serif";

function validate(email, password) {
  const errs = {};
  if (!email.trim()) {
    errs.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errs.email = "Enter a valid email address.";
  }
  if (!password) {
    errs.password = "Password is required.";
  } else if (password.length < 6) {
    errs.password = "Password must be at least 6 characters.";
  }
  return errs;
}

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("admin");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const categories = ["admin", "user manager", "ticket manager"];

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(email, password);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, category: selectedCategory }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({
          show: true,
          message: data.message || "Login failed",
          type: "error",
        });
        return;
      }

      router.push(data.redirectTo);
    } catch {
      setToast({
        show: true,
        message: "Network error. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  const labelStyle = {
    fontFamily: GEIST,
    fontWeight: 400,
    fontSize: "clamp(10px, 0.76vw, 11px)",
    lineHeight: "12px",
    letterSpacing: "0.3px",
    color: "#ffffff",
    display: "block",
    marginBottom: "clamp(4px, 0.4vw, 6px)",
  };

  const errorStyle = {
    fontFamily: GEIST,
    fontWeight: 400,
    fontSize: "clamp(9px, 0.7vw, 11px)",
    color: ERROR_COLOR,
    marginTop: "clamp(3px, 0.3vw, 5px)",
    display: "block",
  };

  function inputStyle(hasError) {
    return {
      width: "100%",
      background: INPUT_BG,
      border: `1.5px solid ${hasError ? ERROR_COLOR : "transparent"}`,
      borderRadius: "140px",
      padding: "clamp(9px, 0.9vw, 13px) clamp(12px, 1vw, 16px)",
      color: "#ffffff",
      fontFamily: GEIST,
      fontWeight: 400,
      fontSize: "clamp(11px, 0.9vw, 14px)",
    };
  }

  return (
    <>
      <StatusToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />
      <Head>
        <title>Linkaro</title>
      </Head>
      <div
        style={{
          minHeight: "100vh",
          background: "#000f2c",
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top-right gradient overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "55%",
            height: "70%",
            background:
              "radial-gradient(ellipse at 95% 2%, rgba(0, 80, 210, 0.45) 0%, rgba(0, 50, 160, 0.2) 35%, transparent 62%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Left panel — background image */}
        <div
          className="login-bg-panel"
          style={{
            width: "clamp(260px, 46%, 680px)",
            padding:
              "clamp(12px, 1.4vw, 20px) clamp(6px, 0.5vw, 8px) clamp(12px, 1.4vw, 20px) clamp(12px, 1.4vw, 20px)",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "clamp(14px, 1.5vw, 22px)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Image
              src="/login-background.png"
              alt="Linkaro background"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>

        {/* Right panel — form */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding:
              "clamp(24px, 4vw, 80px) clamp(24px, 3vw, 60px) clamp(24px, 4vw, 80px) clamp(10px, 1vw, 16px)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ width: "100%", maxWidth: "clamp(300px, 36vw, 510px)" }}
          >
            {/* Logo */}
            <div style={{ marginBottom: "clamp(16px, 2vw, 28px)" }}>
              <Image
                src="/logo.png"
                alt="Linkaro"
                width={187}
                height={93}
                style={{ width: "clamp(120px, 13vw, 187px)", height: "auto" }}
                priority
              />
            </div>

            {/* Heading */}
            <h1
              style={{
                fontFamily: PP_MORI,
                fontWeight: 600,
                fontSize: "clamp(22px, 2.36vw, 34px)",
                lineHeight: "clamp(22px, 2.01vw, 29px)",
                letterSpacing: "-0.02em",
                color: "#ffffff",
                margin: "0 0 clamp(6px, 0.7vw, 10px) 0",
              }}
            >
              Login to your account
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontFamily: GEIST,
                fontWeight: 400,
                fontSize: "clamp(13px, 1.32vw, 19px)",
                lineHeight: "clamp(16px, 1.46vw, 21px)",
                letterSpacing: "0.02em",
                color: "#ffffff",
                margin: "0 0 clamp(18px, 2.2vw, 32px) 0",
                opacity: 0.9,
              }}
            >
              Measure your advertising ROI and report website traffic.
            </p>

            {/* Email field */}
            <div style={{ marginBottom: "clamp(10px, 1.1vw, 16px)" }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: "" }));
                }}
                style={inputStyle(!!errors.email)}
              />
              {errors.email && <span style={errorStyle}>{errors.email}</span>}
            </div>

            {/* Password field */}
            <div style={{ marginBottom: "clamp(8px, 1vw, 14px)" }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  style={{
                    ...inputStyle(!!errors.password),
                    paddingRight: "clamp(38px, 3vw, 48px)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: "clamp(10px, 0.9vw, 14px)",
                    top: errors.password ? "calc(50% - 8px)" : "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    lineHeight: 0,
                  }}
                >
                  <img
                    src={showPassword ? "/eye-hide.ico" : "/eye.png"}
                    alt={showPassword ? "Hide password" : "Show password"}
                    style={{
                      width: "clamp(14px, 1.2vw, 18px)",
                      height: "clamp(14px, 1.2vw, 18px)",
                      objectFit: "contain",
                      filter: "brightness(0) invert(1)",
                      opacity: 0.65,
                    }}
                  />
                </button>
              </div>
              {errors.password && (
                <span style={errorStyle}>{errors.password}</span>
              )}
            </div>

            {/* Remember me + Forgot password */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "clamp(12px, 1.5vw, 22px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(6px, 0.55vw, 8px)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setRememberMe((v) => !v)}
                  aria-label="Toggle remember me"
                  style={{
                    width: "clamp(32px, 2.5vw, 38px)",
                    height: "clamp(18px, 1.4vw, 21px)",
                    background: rememberMe ? ORANGE : "#555555",
                    borderRadius: "100px",
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
                      left: rememberMe
                        ? "calc(100% - clamp(19px, 1.5vw, 22px))"
                        : "2px",
                      width: "clamp(14px, 1.1vw, 17px)",
                      height: "clamp(14px, 1.1vw, 17px)",
                      background: "#ffffff",
                      borderRadius: "50%",
                      transition: "left 0.2s",
                    }}
                  />
                </button>
                <span
                  style={{
                    fontFamily: GEIST,
                    fontWeight: 400,
                    fontSize: "clamp(10px, 0.76vw, 11px)",
                    lineHeight: "12px",
                    letterSpacing: "0.3px",
                    color: "#ffffff",
                  }}
                >
                  Remember me
                </span>
              </div>

              <a
                href="#"
                style={{
                  fontFamily: GEIST,
                  fontWeight: 500,
                  fontSize: "clamp(10px, 0.76vw, 11px)",
                  lineHeight: "12px",
                  letterSpacing: "0.3px",
                  color: "#007AFF",
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Select Category */}
            <div style={{ marginBottom: "clamp(12px, 1.5vw, 20px)" }}>
              <label
                style={{
                  fontFamily: GEIST,
                  fontWeight: 400,
                  fontSize: "clamp(10px, 0.83vw, 12px)",
                  lineHeight: "1",
                  letterSpacing: "0",
                  color: "#ffffff",
                  display: "block",
                  marginBottom: "clamp(8px, 0.8vw, 12px)",
                }}
              >
                Select Category
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "clamp(6px, 0.7vw, 10px)",
                  flexWrap: "wrap",
                }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      background: INPUT_BG,
                      border: `1.5px solid ${selectedCategory === cat ? ORANGE : "transparent"}`,
                      borderRadius: "200px",
                      padding:
                        "clamp(7px, 0.65vw, 10px) clamp(14px, 1.4vw, 22px)",
                      fontFamily: GEIST,
                      fontWeight: 400,
                      fontSize: "clamp(11px, 1.04vw, 15px)",
                      lineHeight: "1",
                      letterSpacing: "-0.02em",
                      color: selectedCategory === cat ? "#ffffff" : "#929292",
                      cursor: "pointer",
                      transition: "color 0.15s, border-color 0.15s",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sign In button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: ORANGE,
                border: "none",
                borderRadius: "140px",
                padding: "clamp(12px, 1.15vw, 17px) 0",
                fontFamily: GEIST,
                fontWeight: 600,
                fontSize: "clamp(13px, 1.2vw, 17.3px)",
                lineHeight: "0.9",
                letterSpacing: "-0.03em",
                color: "#ffffff",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                marginTop: "clamp(8px, 0.8vw, 12px)",
                marginBottom: "clamp(16px, 1.8vw, 26px)",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.15)",
                width: "100%",
              }}
            />
          </form>
        </div>
      </div>
    </>
  );
}
