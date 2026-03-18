import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle, Lock, User } from "lucide-react";
import { auth as apiAuth, loyalty as loyaltyApi, ApiRestaurant, restaurants as restaurantsApi } from "@/api";
import { toast } from "sonner";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  color: "#fff",
  fontSize: 16,           // ↑ prevents iOS zoom & easier to read
  padding: "14px 14px 14px 44px",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  WebkitAppearance: "none",
  appearance: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "rgba(255,255,255,0.5)",
  fontSize: 13,           // ↑ 11→13
  fontFamily: "monospace",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 8,
};

const CARD_GRADIENTS: [string, string][] = [
  ["#c8f03c", "#7a9e10"],
  ["#f59e0b", "#b45309"],
  ["#a78bfa", "#6d28d9"],
  ["#34d399", "#059669"],
  ["#f87171", "#dc2626"],
  ["#60a5fa", "#2563eb"],
];

const Register = () => {
  const { registerLink } = useParams<{ registerLink: string }>();
  const [restaurant, setRestaurant] = useState<ApiRestaurant | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");

  const gradientIdx = registerLink
    ? registerLink.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % CARD_GRADIENTS.length
    : 0;
  const [g1, g2] = CARD_GRADIENTS[gradientIdx];

  useEffect(() => {
    restaurantsApi.list()
      .then((list) => {
        const found = list.find((r) => r.registerLink === registerLink);
        if (found) setRestaurant(found);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
  }, [registerLink]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !password.trim()) return;
    setIsLoading(true);
    try {
      await apiAuth.register(nickname.trim(), password.trim());
      await loyaltyApi.join(undefined, registerLink);
      setSubmitted(true);
      toast.success("Registration successful!");
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", background: "#080809", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 24, boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 17, marginBottom: 20 }}>Restaurant not found</p>
          <Link to="/" style={{ color: "#c8f03c", fontSize: 15, fontFamily: "monospace" }}>← Back to Wallet</Link>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ minHeight: "100vh", background: "#080809", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "2px solid #c8f03c", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", minHeight: "100dvh" as any,
      background: "#080809", fontFamily: "'DM Sans', system-ui, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      paddingTop: "max(20px, env(safe-area-inset-top, 0px))",
      paddingBottom: "max(20px, env(safe-area-inset-bottom, 0px))",
      paddingLeft: "max(16px, env(safe-area-inset-left, 0px))",
      paddingRight: "max(16px, env(safe-area-inset-right, 0px))",
      position: "relative", overflow: "hidden", boxSizing: "border-box",
    }}>
      <div style={{ position: "fixed", top: "-120px", left: "50%", transform: "translateX(-50%)", width: "min(500px, 130vw)", height: "min(500px, 130vw)", borderRadius: "50%", background: `radial-gradient(circle, ${g1}15 0%, transparent 70%)`, pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: "min(420px, 100%)" }}
      >
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle style={{ width: 36, height: 36, color: "#4ade80" }} />
            </div>
            <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 10 }}>You're in! 🎉</h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, marginBottom: 28, lineHeight: 1.5 }}>
              Your <strong style={{ color: "#fff" }}>{restaurant.name}</strong> loyalty card is now active.
            </p>
            <div style={{ borderRadius: 20, background: `linear-gradient(160deg, ${g1} 0%, ${g2} 100%)`, padding: "20px 24px", marginBottom: 28, color: "#1a1a1a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                  {restaurant.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{restaurant.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.6, fontFamily: "monospace" }}>Loyalty Card</div>
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>0 pts</div>
              <div style={{ height: 4, borderRadius: 999, background: "rgba(0,0,0,0.15)", marginTop: 10 }}>
                <div style={{ width: "0%", height: "100%", borderRadius: 999, background: "rgba(0,0,0,0.4)" }} />
              </div>
            </div>
            <Link to="/" style={{ display: "inline-block", background: "linear-gradient(135deg, #c8f03c, #7a9e10)", borderRadius: 14, padding: "16px 32px", fontSize: 17, fontWeight: 700, color: "#1a1a1a", textDecoration: "none", letterSpacing: "-0.01em" }}>
              Open Wallet →
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Restaurant header card */}
            <div style={{ borderRadius: 24, background: `linear-gradient(160deg, ${g1} 0%, ${g2} 100%)`, padding: "20px 22px", marginBottom: 20, color: "#1a1a1a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {restaurant.logoUrl ? (
                  <img src={restaurant.logoUrl} alt={restaurant.name} style={{ width: 56, height: 56, borderRadius: 16, objectFit: "cover", border: "2px solid rgba(0,0,0,0.15)", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 56, height: 56, minWidth: 56, borderRadius: 16, background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                    {restaurant.icon}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {restaurant.name}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.65, fontFamily: "monospace" }}>Join the loyalty program</div>
                </div>
              </div>
              {restaurant.description && (
                <p style={{ marginTop: 12, fontSize: 14, opacity: 0.7, lineHeight: 1.5, margin: "12px 0 0" }}>
                  {restaurant.description}
                </p>
              )}
            </div>

            {/* Form */}
            <div style={{ borderRadius: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "24px 20px" }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
                Create your account
              </div>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Username</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", display: "flex", pointerEvents: "none" }}>
                      <User size={18} />
                    </div>
                    <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="choose_nickname" style={inputStyle} autoCapitalize="none" autoCorrect="off" required />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", display: "flex", pointerEvents: "none" }}>
                      <Lock size={18} />
                    </div>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} required />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} style={{
                  background: isLoading ? "rgba(200,240,60,0.4)" : "linear-gradient(135deg, #c8f03c, #7a9e10)",
                  border: "none", borderRadius: 14, padding: "16px",
                  fontSize: 17,           // ↑ 14→17
                  fontWeight: 700,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  color: "#1a1a1a", marginTop: 4,
                  letterSpacing: "-0.01em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", minHeight: 52,
                  WebkitTapHighlightColor: "transparent", fontFamily: "inherit",
                }}>
                  <CreditCard size={18} />
                  {isLoading ? "Registering..." : "Join & Get Card →"}
                </button>
              </form>
              <div style={{ marginTop: 18, textAlign: "center" }}>
                <Link to="/login" style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, fontFamily: "monospace", textDecoration: "none" }}>
                  Already have an account? Sign in
                </Link>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Register;