import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [regNickname, setRegNickname] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(nickname, password);
      toast.success(`Xoş gəldin, ${user.nickname}!`);
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (err: any) {
      toast.error(err.message || "Məlumatlar yanlışdır");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== confirmPassword) {
      toast.error("Şifrələr uyğun gəlmir");
      return;
    }
    setIsLoading(true);
    try {
      const user = await register(regNickname, regPassword, adminSecret);
      toast.success(`Qeydiyyat uğurludur, ${user.nickname}!`);
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (err: any) {
      toast.error(err.message || "Qeydiyyat xətası");
    } finally {
      setIsLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  //                YENİLƏNMİŞ STİLLƏR
  // ────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    minHeight: "100dvh",
    background: "#050505",
    fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    position: "relative",
    overflowX: "hidden",
  };

  const glowStyle: React.CSSProperties = {
    position: "fixed",
    borderRadius: "50%",
    pointerEvents: "none",
    filter: "blur(80px)",
    zIndex: 0,
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "540px", 
    borderRadius: 40,
    background: "rgba(255,255,255,0.035)",
    backdropFilter: "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
    overflow: "hidden",
    zIndex: 1,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "rgba(255,255,255,0.7)", // daha aydın
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    marginBottom: 12,
    paddingLeft: 8,
    textTransform: "uppercase",
  };

  const inputWrapperStyle: React.CSSProperties = {
    position: "relative",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.08)",
    border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: 22,
    color: "#ffffff",
    fontSize: "18px", // Sabit daha iri ölçü
    padding: "20px 20px 20px 60px",
    outline: "none",
    transition: "all 0.25s ease",
    WebkitAppearance: "none",
    appearance: "none",
    fontFamily: "inherit",
  };

  const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: 22,
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(255,255,255,0.5)",
    pointerEvents: "none",
  };

  const buttonStyle: React.CSSProperties = {
    background: isLoading ? "rgba(200,240,60,0.3)" : "#c8f03c",
    border: "none",
    borderRadius: 24,
    padding: "22px",
    fontSize: "19px",
    fontWeight: 800,
    color: "#000000",
    cursor: isLoading ? "not-allowed" : "pointer",
    marginTop: 20,
    width: "100%",
    transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
    boxShadow: "0 15px 35px rgba(200,240,60,0.25)",
  };

  return (
    <div style={containerStyle}>
      {/* Arxa fon effektləri */}
      <div style={{ ...glowStyle, top: "-10%", left: "-10%", width: "80vw", height: "80vw", background: "radial-gradient(circle, rgba(200,240,60,0.12) 0%, transparent 70%)" }} />
      <div style={{ ...glowStyle, bottom: "-10%", right: "-10%", width: "70vw", height: "70vw", background: "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: "540px", zIndex: 2 }}
      >
        {/* Başlıq Bölməsi */}
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            style={{
              width: 100,
              height: 100,
              margin: "0 auto 28px",
              borderRadius: 32,
              background: "linear-gradient(135deg, #c8f03c 0%, #a3c71e 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              boxShadow: "0 20px 50px rgba(200,240,60,0.2)",
            }}
          >
            🃏
          </motion.div>

          <h1 style={{ color: "#ffffff", fontSize: "clamp(42px, 10vw, 54px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 14px", lineHeight: 1 }}>
            Wallet
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "18px", fontWeight: 500, margin: 0 }}>
            Loyalty cards, reimagined
          </p>
        </div>

        <motion.div layout style={cardStyle}>
          {/* Tablar */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", padding: 12, gap: 10 }}>
            {(["login", "register"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: "18px 0",
                  background: activeTab === tab ? "#c8f03c" : "transparent",
                  border: "none",
                  borderRadius: 22,
                  color: activeTab === tab ? "#000000" : "rgba(255,255,255,0.6)",
                  fontSize: "17px",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                {tab === "login" ? "Giriş" : "Qeydiyyat"}
              </button>
            ))}
          </div>

          <div style={{ position: "relative" }}>
            <AnimatePresence mode="wait">
              {activeTab === "login" ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                  style={{ padding: "40px 32px" }}
                >
                  <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                    <div>
                      <label style={labelStyle}>İstifadəçi adı</label>
                      <div style={inputWrapperStyle}>
                        <div style={iconStyle}><User size={24} /></div>
                        <input
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value.trim())}
                          placeholder="nikneym_yazın"
                          style={inputStyle}
                          autoCapitalize="none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Şifrə</label>
                      <div style={inputWrapperStyle}>
                        <div style={iconStyle}><Lock size={24} /></div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          style={inputStyle}
                          required
                        />
                      </div>
                    </div>

                    <motion.button whileTap={{ scale: 0.96 }} type="submit" disabled={isLoading} style={buttonStyle}>
                      {isLoading ? "Giriş edilir..." : "Daxil ol"}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                  style={{ padding: "40px 32px" }}
                >
                  <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div>
                      <label style={labelStyle}>Yeni istifadəçi adı</label>
                      <div style={inputWrapperStyle}>
                        <div style={iconStyle}><User size={24} /></div>
                        <input
                          value={regNickname}
                          onChange={(e) => setRegNickname(e.target.value.trim())}
                          placeholder="nikneym seçin"
                          style={inputStyle}
                          autoCapitalize="none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Şifrə</label>
                      <div style={inputWrapperStyle}>
                        <div style={iconStyle}><Lock size={24} /></div>
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          style={inputStyle}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Şifrəni təsdiqlə</label>
                      <div style={inputWrapperStyle}>
                        <div style={iconStyle}><Lock size={24} /></div>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          style={inputStyle}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Admin Secret</label>
                      <div style={inputWrapperStyle}>
                        <div style={iconStyle}><KeyRound size={24} /></div>
                        <input
                          type="password"
                          value={adminSecret}
                          onChange={(e) => setAdminSecret(e.target.value)}
                          placeholder="İstəyə bağlı"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <motion.button whileTap={{ scale: 0.96 }} type="submit" disabled={isLoading} style={buttonStyle}>
                      {isLoading ? "Yaradılır..." : "Hesab yarat"}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "16px", marginTop: 40, fontWeight: 600, letterSpacing: "0.02em" }}>
          Loyalty points • QR oxutma • Mükafatlar
        </p>
      </motion.div>
    </div>
  );
};

export default Login;