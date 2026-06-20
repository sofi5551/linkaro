import Head from "next/head";
import Image from "next/image";

const GEIST = "'Geist', sans-serif";
const PP_MORI = "'PP Mori', sans-serif";

export function H2({ children }) {
  return (
    <h2
      style={{
        fontFamily: PP_MORI,
        fontWeight: 600,
        fontSize: "clamp(16px, 1.4vw, 20px)",
        color: "#ffffff",
        margin: "clamp(20px, 2.5vw, 32px) 0 clamp(8px, 1vw, 12px) 0",
      }}
    >
      {children}
    </h2>
  );
}

export default function LegalLayout({ title, updatedAt, children }) {
  return (
    <>
      <Head>
        <title>{title} | Linkaro</title>
      </Head>
      <div
        style={{
          minHeight: "100vh",
          background: "#000f2c",
          padding: "clamp(24px, 5vw, 64px) clamp(16px, 4vw, 24px)",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Image
            src="/logo.png"
            alt="Linkaro"
            width={140}
            height={70}
            style={{
              width: "clamp(100px, 10vw, 140px)",
              height: "auto",
              marginBottom: "clamp(24px, 3vw, 40px)",
            }}
          />

          <h1
            style={{
              fontFamily: PP_MORI,
              fontWeight: 600,
              fontSize: "clamp(24px, 3vw, 36px)",
              letterSpacing: "-0.02em",
              color: "#ffffff",
              margin: "0 0 8px 0",
            }}
          >
            {title}
          </h1>

          {updatedAt && (
            <p
              style={{
                fontFamily: GEIST,
                fontSize: "clamp(11px, 1vw, 13px)",
                color: "rgba(255,255,255,0.5)",
                margin: "0 0 clamp(24px, 3vw, 40px) 0",
              }}
            >
              Last updated: {updatedAt}
            </p>
          )}

          <div
            style={{
              fontFamily: GEIST,
              fontWeight: 400,
              fontSize: "clamp(13px, 1.1vw, 15px)",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.85)",
              paddingBottom: "clamp(40px, 5vw, 64px)",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
