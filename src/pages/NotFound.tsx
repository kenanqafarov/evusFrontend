import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: Non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080809",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "clamp(16px, 5vw, 24px)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: "min(400px, 90vw)", height: "min(400px, 90vw)", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", maxWidth: "min(360px, 100%)", width: "100%" }}
      >
        <div style={{
          fontSize: "clamp(56px, 18vw, 72px)",
          fontWeight: 900,
          letterSpacing: "-0.05em",
          background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 8,
          lineHeight: 1,
        }}>
          404
        </div>
        <div style={{
          fontSize: "clamp(16px, 5vw, 20px)",
          color: "#fff",
          fontWeight: 700,
          marginBottom: 10,
          letterSpacing: "-0.02em",
        }}>
          Page not found
        </div>
        <p style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: "clamp(11px, 3.5vw, 14px)",
          marginBottom: 32,
          fontFamily: "monospace",
          wordBreak: "break-all",
          padding: "0 8px",
        }}>
          {location.pathname} does not exist
        </p>
        <Link to="/" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "linear-gradient(135deg, #c8f03c, #7a9e10)",
          border: "none",
          borderRadius: 14,
          padding: "clamp(10px, 3vw, 13px) clamp(20px, 6vw, 28px)",
          fontSize: "clamp(13px, 4vw, 14px)",
          fontWeight: 700,
          color: "#1a1a1a",
          textDecoration: "none",
          letterSpacing: "-0.01em",
        }}>
          ← Back to Wallet
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;