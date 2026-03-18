import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, Pencil, Trash2, Store, CreditCard, Copy, Check, LogOut, Link as LinkIcon, QrCode, Palette } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { restaurants as restaurantsApi, loyalty as loyaltyApi, ApiRestaurant, ApiLoyaltyCard, getUserNickname } from "@/api";
import { toast } from "sonner";
import QRCode from "qrcode";

const CARD_COLORS = [
  { hex: "#c5e840", label: "Lime" },
  { hex: "#f0c040", label: "Amber" },
  { hex: "#60d0a0", label: "Mint" },
  { hex: "#f08060", label: "Coral" },
  { hex: "#80b0f0", label: "Sky" },
  { hex: "#c080f0", label: "Violet" },
  { hex: "#f0a0c0", label: "Rose" },
  { hex: "#a0d0e0", label: "Teal" },
  { hex: "#e8d0a0", label: "Sand" },
  { hex: "#1a1a2e", label: "Navy" },
  { hex: "#2d2d2d", label: "Charcoal" },
  { hex: "#0f3d2e", label: "Forest" },
];

const emptyForm = (): Partial<ApiRestaurant> => ({
  name: "", icon: "🍽️", logoUrl: "", description: "", address: "", phone: "",
  cardBgColor: "#c5e840", featuredDish: "", featuredDishImage: "", featuredDishMeta: "",
} as any);

// ↑ fontSize 16px everywhere to prevent iOS auto-zoom, better tap comfort
const fieldStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  color: "#fff",
  fontSize: 16,
  padding: "13px 14px",
  width: "100%",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  WebkitAppearance: "none",
  appearance: "none",
};

const labelStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.5)",
  fontSize: 13,           // ↑ 11→13
  fontFamily: "monospace",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  display: "block",
  marginBottom: 7,
};

// ── Card Preview ──────────────────────────────────────────────────────────
const CardPreview = ({ rest }: { rest: Partial<ApiRestaurant> }) => {
  const bg = (rest as any).cardBgColor || "#c5e840";
  const isDark = (() => {
    const hex = bg.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
  })();
  const textMain = isDark ? "#fff" : "#1a1a1a";
  const textSub = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)";
  const overlay = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";

  return (
    <div style={{ borderRadius: 20, overflow: "hidden", background: bg, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
          <div style={{ width: 28, height: 28, minWidth: 28, borderRadius: 8, background: overlay, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
            {rest.icon || "🍽️"}
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: textMain, letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {rest.name || "Restaurant name"}
          </span>
        </div>
        {rest.description && (
          <span style={{ background: overlay, borderRadius: 999, padding: "2px 8px", fontSize: 11, color: textSub, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0, marginLeft: 6 }}>
            {rest.description}
          </span>
        )}
      </div>
      <div style={{ width: "100%", height: 110, background: overlay, overflow: "hidden", position: "relative" }}>
        {(rest as any).featuredDishImage ? (
          <img src={(rest as any).featuredDishImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, opacity: 0.5 }}>
            {rest.icon || "🍽️"}
          </div>
        )}
      </div>
      <div style={{ padding: "10px 14px 13px" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: textMain, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 8 }}>
          {(rest as any).featuredDish || "Featured dish"}
        </div>
        <div style={{ height: 3, borderRadius: 999, background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)" }}>
          <div style={{ height: "100%", width: "45%", borderRadius: 999, background: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)" }} />
        </div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", background: isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.5)", border: `1px solid ${isDark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.7)"}`, borderRadius: 10, padding: "6px 10px" }}>
          <span style={{ fontSize: 11, color: textSub }}>Scan at cashier</span>
          <div style={{ width: 28, height: 28, background: "#fff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 20 20" width="20" height="20">
              <rect x="1" y="1" width="7" height="7" rx="1" fill="none" stroke="#111" strokeWidth="1.5"/>
              <rect x="3" y="3" width="3" height="3" fill="#111"/>
              <rect x="12" y="1" width="7" height="7" rx="1" fill="none" stroke="#111" strokeWidth="1.5"/>
              <rect x="14" y="3" width="3" height="3" fill="#111"/>
              <rect x="1" y="12" width="7" height="7" rx="1" fill="none" stroke="#111" strokeWidth="1.5"/>
              <rect x="3" y="14" width="3" height="3" fill="#111"/>
              <rect x="12" y="12" width="3" height="3" fill="#111"/>
              <rect x="17" y="12" width="2" height="2" fill="#111"/>
              <rect x="12" y="17" width="3" height="2" fill="#111"/>
              <rect x="16" y="15" width="3" height="4" fill="#111"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Color Picker ──────────────────────────────────────────────────────────
const ColorPicker = ({ value, onChange }: { value: string; onChange: (c: string) => void }) => (
  <div>
    <label style={labelStyle}>Card Background Color</label>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
      {CARD_COLORS.map((c) => (
        <button key={c.hex} title={c.label} onClick={() => onChange(c.hex)} style={{
          width: 40, height: 40, borderRadius: 10, background: c.hex, border: "none", cursor: "pointer",
          outline: value === c.hex ? "2px solid #fff" : "2px solid transparent",
          outlineOffset: 2, transition: "outline 0.15s",
          WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
        }} />
      ))}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: 48, height: 48, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", cursor: "pointer", padding: 2 }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="#c5e840"
        style={{ ...fieldStyle, width: 140 }} />
    </div>
  </div>
);

// ── Admin ─────────────────────────────────────────────────────────────────
const Admin = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([]);
  const [loyaltyCards, setLoyaltyCards] = useState<ApiLoyaltyCard[]>([]);
  const [loadingRests, setLoadingRests] = useState(true);
  const [loadingCards, setLoadingCards] = useState(true);
  const [activeTab, setActiveTab] = useState<"restaurants" | "cards">("restaurants");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ApiRestaurant>>(emptyForm());
  const [editingRest, setEditingRest] = useState<ApiRestaurant | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrRestName, setQrRestName] = useState("");
  const [issuePoints, setIssuePoints] = useState(0);
  const [issueVisits, setIssueVisits] = useState(0);
  const [showAddPreview, setShowAddPreview] = useState(false);

  useEffect(() => {
    restaurantsApi.list().then(setRestaurants).catch((e) => toast.error(e.message)).finally(() => setLoadingRests(false));
    loyaltyApi.allCards().then(setLoyaltyCards).catch((e) => toast.error(e.message)).finally(() => setLoadingCards(false));
  }, []);

  const handleAddRestaurant = async () => {
    if (!form.name?.trim()) return;
    try {
      const rest = await restaurantsApi.create(form);
      setRestaurants((p) => [...p, rest]);
      setForm(emptyForm()); setShowAddPreview(false);
      toast.success("Restaurant added");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUpdateRestaurant = async () => {
    if (!editingRest) return;
    try {
      const updated = await restaurantsApi.update(editingRest._id, editingRest);
      setRestaurants((p) => p.map((r) => r._id === updated._id ? updated : r));
      setEditingRest(null);
      toast.success("Restaurant updated");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteRestaurant = async (id: string) => {
    try {
      await restaurantsApi.remove(id);
      setRestaurants((p) => p.filter((r) => r._id !== id));
      setLoyaltyCards((p) => p.filter((c) => c.restaurantId._id !== id));
      toast.success("Restaurant deleted");
    } catch (e: any) { toast.error(e.message); }
  };

  const showQr = async (rest: ApiRestaurant) => {
    const link = `${window.location.origin}/register/${rest.registerLink}`;
    const dataUrl = await QRCode.toDataURL(link, { width: 300, margin: 2 });
    setQrDataUrl(dataUrl); setQrRestName(rest.name);
  };

  const handleIssuePoints = async (loyaltyId: string) => {
    try {
      const updated = await loyaltyApi.issuePoints(loyaltyId, issuePoints, issueVisits);
      setLoyaltyCards((p) => p.map((c) => c._id === updated._id ? updated : c));
      setIssuePoints(0); setIssueVisits(0);
      toast.success("Points added");
    } catch (e: any) { toast.error(e.message); }
  };

  const buildLink = (rest: ApiRestaurant) => `${window.location.origin}/register/${rest.registerLink}`;

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    toast.success("Link copied");
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "14px 0",
    background: active ? "rgba(255,255,255,0.1)" : "transparent",
    border: active ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
    borderRadius: 12,
    color: active ? "#fff" : "rgba(255,255,255,0.4)",
    cursor: "pointer",
    fontSize: 15,           // ↑ 13→15
    fontWeight: active ? 700 : 400,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    transition: "all 0.2s", fontFamily: "inherit",
    WebkitTapHighlightColor: "transparent", minHeight: 48,
  });

  const renderDesignFields = (data: any, set: (d: any) => void) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 6 }}>
        <Palette className="w-3.5 h-3.5" /> Card Design
      </div>
      <ColorPicker value={data.cardBgColor || "#c5e840"} onChange={(c) => set({ ...data, cardBgColor: c })} />
      <div>
        <label style={labelStyle}>Featured Dish Name</label>
        <input value={data.featuredDish || ""} onChange={(e) => set({ ...data, featuredDish: e.target.value })} placeholder="e.g. Buffalo chicken pizza" style={fieldStyle} />
      </div>
      <div>
        <label style={labelStyle}>Dish Image URL</label>
        <input value={data.featuredDishImage || ""} onChange={(e) => set({ ...data, featuredDishImage: e.target.value })} placeholder="https://example.com/dish.jpg" style={fieldStyle} />
      </div>
      <div>
        <label style={labelStyle}>Dish Info / Availability</label>
        <input value={data.featuredDishMeta || ""} onChange={(e) => set({ ...data, featuredDishMeta: e.target.value })} placeholder="e.g. Saturday & Sunday only" style={fieldStyle} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", minHeight: "100dvh" as any, background: "#080809", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#fff", overflowX: "hidden" }}>
      <div style={{ position: "fixed", top: -100, left: "50%", transform: "translateX(-50%)", width: "min(600px, 150vw)", height: "min(400px, 100vw)", borderRadius: "50%", background: "radial-gradient(circle, rgba(200,240,60,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── Header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(8,8,9,0.9)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingTop: "max(14px, env(safe-area-inset-top, 0px))", paddingBottom: 14,
        paddingLeft: "max(14px, env(safe-area-inset-left, 0px))", paddingRight: "max(14px, env(safe-area-inset-right, 0px))",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
          <Link to="/">
            <button style={{ width: 44, height: 44, minWidth: 44, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>Admin Panel</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Manage restaurants & cards</div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate("/login"); }} style={{ width: 44, height: 44, minWidth: 44, borderRadius: 12, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}>
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 14px", paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))", position: "relative", zIndex: 1, boxSizing: "border-box" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 6 }}>
          <button style={tabBtnStyle(activeTab === "restaurants")} onClick={() => setActiveTab("restaurants")}>
            <Store className="w-4 h-4" /> Restaurants
          </button>
          <button style={tabBtnStyle(activeTab === "cards")} onClick={() => setActiveTab("cards")}>
            <CreditCard className="w-4 h-4" /> Loyalty Cards
          </button>
        </div>

        {/* ── Restaurants Tab ── */}
        {activeTab === "restaurants" && (
          <>
            <div style={{ borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "18px 16px", marginBottom: 18 }}>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Add Restaurant</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ width: 72, flexShrink: 0 }}>
                    <label style={labelStyle}>Icon</label>
                    <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} style={{ ...fieldStyle, textAlign: "center", fontSize: 22, width: 72, padding: "10px 4px" }} />
                  </div>
                  <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                    <label style={labelStyle}>Name *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Restaurant name" style={fieldStyle} onKeyDown={(e) => e.key === "Enter" && handleAddRestaurant()} />
                  </div>
                </div>
                <div><label style={labelStyle}>Logo URL</label><input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" style={fieldStyle} /></div>
                <div><label style={labelStyle}>Address</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main Street" style={fieldStyle} /></div>
                <div><label style={labelStyle}>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" style={fieldStyle} inputMode="tel" /></div>
                <div><label style={labelStyle}>Description / Category</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Cheesy pizza slice" style={fieldStyle} /></div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14 }}>{renderDesignFields(form, setForm)}</div>
                {showAddPreview && (
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Live Preview</div>
                    <CardPreview rest={form} />
                  </div>
                )}
              </div>

              <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={handleAddRestaurant} disabled={!form.name?.trim()} style={{
                  background: form.name?.trim() ? "linear-gradient(135deg, #c8f03c, #7a9e10)" : "rgba(255,255,255,0.05)",
                  border: "none", borderRadius: 12, padding: "13px 24px",
                  fontSize: 15,           // ↑ 13→15
                  fontWeight: 600,
                  cursor: form.name?.trim() ? "pointer" : "not-allowed",
                  color: form.name?.trim() ? "#1a1a1a" : "rgba(255,255,255,0.2)",
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontFamily: "inherit", WebkitTapHighlightColor: "transparent", minHeight: 48,
                }}>
                  <Plus className="w-4 h-4" /> Add Restaurant
                </button>
                <button onClick={() => setShowAddPreview((v) => !v)} style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12, padding: "13px 20px",
                  fontSize: 15,
                  cursor: "pointer", color: "rgba(255,255,255,0.6)",
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontFamily: "inherit", WebkitTapHighlightColor: "transparent", minHeight: 48,
                }}>
                  <Palette className="w-4 h-4" /> {showAddPreview ? "Hide" : "Preview card"}
                </button>
              </div>
            </div>

            {/* Restaurant list */}
            {loadingRests ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                <div style={{ width: 24, height: 24, border: "2px solid #c8f03c", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : restaurants.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.3)", fontSize: 16 }}>No restaurants yet</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 14 }}>
                {restaurants.map((rest) => {
                  const restCards = loyaltyCards.filter((c) => c.restaurantId._id === rest._id);
                  const link = buildLink(rest);
                  const cardBg = (rest as any).cardBgColor || "#c5e840";
                  return (
                    <motion.div key={rest._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "16px 14px", position: "relative", overflow: "hidden" }}
                      whileHover={{ borderColor: `${cardBg}44` }}
                    >
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: cardBg, borderRadius: "20px 20px 0 0" }} />
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, paddingTop: 4, gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                          {rest.logoUrl ? (
                            <img src={rest.logoUrl} alt={rest.name} style={{ width: 48, height: 48, minWidth: 48, borderRadius: 12, objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} />
                          ) : (
                            <div style={{ width: 48, height: 48, minWidth: 48, borderRadius: 12, background: `${cardBg}22`, border: `1px solid ${cardBg}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{rest.icon}</div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rest.name}</div>
                            {rest.address && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "monospace", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rest.address}</div>}
                            {(rest as any).featuredDish && (
                              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                🍽 {(rest as any).featuredDish}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button onClick={() => showQr(rest)} style={{ width: 40, height: 40, minWidth: 40, borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}>
                            <QrCode className="w-4 h-4" />
                          </button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button onClick={() => setEditingRest({ ...rest })} style={{ width: 40, height: 40, minWidth: 40, borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}>
                                <Pencil className="w-4 h-4" />
                              </button>
                            </DialogTrigger>
                            <DialogContent style={{ background: "#0f0f10", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, maxWidth: "min(680px, calc(100vw - 24px))", width: "calc(100vw - 24px)", maxHeight: "calc(100dvh - 48px)", overflowY: "auto", paddingBottom: "max(24px, env(safe-area-inset-bottom, 0px))" }}>
                              <DialogHeader><DialogTitle style={{ color: "#fff", fontSize: 18 }}>Edit Restaurant</DialogTitle></DialogHeader>
                              {editingRest && editingRest._id === rest._id && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 8 }}>
                                  <div style={{ display: "flex", gap: 10 }}>
                                    <input value={editingRest.icon} onChange={(e) => setEditingRest({ ...editingRest, icon: e.target.value })} style={{ ...fieldStyle, width: 72, textAlign: "center", fontSize: 22, flexShrink: 0, padding: "10px 4px" }} />
                                    <input value={editingRest.name} onChange={(e) => setEditingRest({ ...editingRest, name: e.target.value })} placeholder="Name" style={{ ...fieldStyle, flex: 1 }} />
                                  </div>
                                  <input value={editingRest.logoUrl || ""} onChange={(e) => setEditingRest({ ...editingRest, logoUrl: e.target.value })} placeholder="Logo URL" style={fieldStyle} />
                                  <input value={editingRest.address || ""} onChange={(e) => setEditingRest({ ...editingRest, address: e.target.value })} placeholder="Address" style={fieldStyle} />
                                  <input value={editingRest.phone || ""} onChange={(e) => setEditingRest({ ...editingRest, phone: e.target.value })} placeholder="Phone" style={fieldStyle} inputMode="tel" />
                                  <input value={editingRest.description || ""} onChange={(e) => setEditingRest({ ...editingRest, description: e.target.value })} placeholder="Description / Category" style={fieldStyle} />
                                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12 }}>
                                    {renderDesignFields(editingRest, setEditingRest)}
                                  </div>
                                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12 }}>
                                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Live Preview</div>
                                    <CardPreview rest={editingRest} />
                                  </div>
                                  <button onClick={handleUpdateRestaurant} style={{ background: "linear-gradient(135deg, #c8f03c, #7a9e10)", border: "none", borderRadius: 12, padding: "15px", fontSize: 16, fontWeight: 600, cursor: "pointer", color: "#1a1a1a", marginTop: 4, fontFamily: "inherit", minHeight: 52 }}>
                                    Save Changes
                                  </button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <button onClick={() => handleDeleteRestaurant(rest._id)} style={{ width: 40, height: 40, minWidth: 40, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {rest.description && (
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 12, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {rest.description}
                        </p>
                      )}

                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "5px 12px", fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "monospace", display: "flex", alignItems: "center", gap: 5 }}>
                          <CreditCard className="w-3.5 h-3.5" /> {restCards.length} cards
                        </div>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: cardBg, border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }} title={`Card color: ${cardBg}`} />
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", display: "flex", alignItems: "center", gap: 4 }}>
                            <LinkIcon className="w-3 h-3" /> Register Link
                          </span>
                          <button onClick={() => copyLink(link)} style={{ background: "none", border: "none", color: copiedLink === link ? "#c8f03c" : "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 4, fontFamily: "monospace", WebkitTapHighlightColor: "transparent", padding: "4px 8px", minHeight: 36 }}>
                            {copiedLink === link ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                          </button>
                        </div>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{link}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Cards Tab ── */}
        {activeTab === "cards" && (
          <>
            {loadingCards ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                <div style={{ width: 24, height: 24, border: "2px solid #c8f03c", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              </div>
            ) : loyaltyCards.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.3)", fontSize: 16 }}>No loyalty cards yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {loyaltyCards.map((card) => {
                  const cardBg = (card.restaurantId as any).cardBgColor || "#c8f03c";
                  return (
                    <motion.div key={card._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "14px 14px", borderLeft: `3px solid ${cardBg}` }}
                    >
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: "1 1 180px" }}>
                          <div style={{ width: 44, height: 44, minWidth: 44, borderRadius: 12, background: `${cardBg}22`, border: `1px solid ${cardBg}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                            {card.restaurantId.icon}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.restaurantId.name}</div>
                            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "monospace", marginTop: 2 }}>
                              👤 {getUserNickname(card)} · {new Date(card.joinDate).toLocaleDateString("en")}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ background: `${cardBg}22`, border: `1px solid ${cardBg}44`, borderRadius: 8, padding: "5px 12px", fontSize: 13, fontFamily: "monospace", color: cardBg, whiteSpace: "nowrap" }}>
                            🏅 {card.pointsBalance} pts
                          </span>
                          <span style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 12px", fontSize: 13, fontFamily: "monospace", color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>
                            🚪 {card.visitCount} visits
                          </span>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button onClick={() => { setIssuePoints(0); setIssueVisits(0); }} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "9px 16px", fontSize: 14, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", WebkitTapHighlightColor: "transparent", minHeight: 40, whiteSpace: "nowrap" }}>
                                <Plus className="w-3.5 h-3.5" /> Issue Points
                              </button>
                            </DialogTrigger>
                            <DialogContent style={{ background: "#0f0f10", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, maxWidth: "min(360px, calc(100vw - 24px))", width: "calc(100vw - 24px)" }}>
                              <DialogHeader><DialogTitle style={{ color: "#fff", fontSize: 18 }}>Add Points / Visits</DialogTitle></DialogHeader>
                              <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 8 }}>
                                <div>
                                  <label style={labelStyle}>Points Amount</label>
                                  <input type="number" inputMode="numeric" min={0} value={issuePoints} onChange={(e) => setIssuePoints(Number(e.target.value))} style={fieldStyle} />
                                </div>
                                <div>
                                  <label style={labelStyle}>Visit Count</label>
                                  <input type="number" inputMode="numeric" min={0} value={issueVisits} onChange={(e) => setIssueVisits(Number(e.target.value))} style={fieldStyle} />
                                </div>
                                <button onClick={() => handleIssuePoints(card._id)} style={{ background: "linear-gradient(135deg, #c8f03c, #7a9e10)", border: "none", borderRadius: 12, padding: "15px", fontSize: 16, fontWeight: 600, cursor: "pointer", color: "#1a1a1a", fontFamily: "inherit", minHeight: 52 }}>
                                  Confirm
                                </button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <div style={{ height: 3, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(100, Math.round((card.pointsBalance / 3000) * 100))}%`, borderRadius: 999, background: cardBg, transition: "width 0.6s" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
                          <span>{Math.min(100, Math.round((card.pointsBalance / 3000) * 100))}% to reward</span>
                          <span>{3000 - Math.min(3000, card.pointsBalance)} pts remaining</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* QR Modal */}
      <Dialog open={!!qrDataUrl} onOpenChange={(o) => { if (!o) setQrDataUrl(null); }}>
        <DialogContent style={{ background: "#0f0f10", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, maxWidth: "min(320px, calc(100vw - 24px))", width: "calc(100vw - 24px)", textAlign: "center" }}>
          <DialogHeader><DialogTitle style={{ color: "#fff", fontSize: 18 }}>{qrRestName} — QR Code</DialogTitle></DialogHeader>
          {qrDataUrl && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingBlock: 8 }}>
              <div style={{ padding: 16, background: "#fff", borderRadius: 16 }}>
                <img src={qrDataUrl} alt="QR Code" style={{ width: "min(200px, calc(100vw - 100px))", height: "min(200px, calc(100vw - 100px))", borderRadius: 8, display: "block" }} />
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "monospace" }}>
                Customer scans this to join the program
              </p>
              <a href={qrDataUrl} download={`${qrRestName}-qr.png`} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "13px 24px", color: "#fff", textDecoration: "none", fontSize: 15, minHeight: 48, display: "flex", alignItems: "center" }}>
                Download PNG
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;