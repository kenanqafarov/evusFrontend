import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, LogOut, Camera, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import jsQR from "jsqr";
import type { LoyaltyCard } from "@/types/card";
import { useAuth } from "@/contexts/AuthContext";
import { loyalty as loyaltyApi, ApiLoyaltyCard } from "@/api";
import { toast } from "sonner";

const mapCard = (c: ApiLoyaltyCard): LoyaltyCard => ({
  id: c._id,
  restaurantId: c.restaurantId._id,
  brandName: c.restaurantId.name,
  brandIcon: c.restaurantId.icon,
  logoUrl: c.restaurantId.logoUrl,
  pointsBalance: c.pointsBalance,
  visitCount: c.visitCount,
  joinDate: c.joinDate,
  backgroundColor: "#1a1a2e",
  accentColor: "#e94560",
  textColor: "#ffffff",
  cardBgColor: (c.restaurantId as any).cardBgColor || "#c5e840",
  featuredDish: (c.restaurantId as any).featuredDish || "",
  featuredDishImage: (c.restaurantId as any).featuredDishImage || "",
  featuredDishMeta: (c.restaurantId as any).featuredDishMeta || "",
  category: (c.restaurantId as any).description || "",
});

// ─── Mini QR SVG ──────────────────────────────────────────────────────────
function MiniQR({ value, size = 58 }: { value: string; size?: number }) {
  const seed = value.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = 13;
  const cs = size / cells;
  const grid: boolean[] = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const inCorner =
        (r < 5 && c < 5) || (r < 5 && c >= cells - 5) || (r >= cells - 5 && c < 5);
      if (inCorner) {
        const isOuter = (r === 0 || r === 4 || c === 0 || c === 4) && r <= 4 && c <= 4;
        const isOuter2 = (r === 0 || r === 4 || c === cells - 5 || c === cells - 1) && r <= 4 && c >= cells - 5;
        const isOuter3 = (r === cells - 5 || r === cells - 1 || c === 0 || c === 4) && r >= cells - 5 && c <= 4;
        const isInner =
          (r >= 1 && r <= 3 && c >= 1 && c <= 3) ||
          (r >= 1 && r <= 3 && c >= cells - 4 && c <= cells - 2) ||
          (r >= cells - 4 && r <= cells - 2 && c >= 1 && c <= 3);
        grid.push(isOuter || isOuter2 || isOuter3 || isInner);
      } else {
        grid.push(((seed * (r * 29 + c * 13 + 5)) % 100) < 42);
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" rx="6" />
      {grid.map((on, i) => {
        const r = Math.floor(i / cells);
        const c = i % cells;
        return on ? (
          <rect key={i} x={c * cs + 0.3} y={r * cs + 0.3}
            width={cs - 0.6} height={cs - 0.6} fill="#111" rx="0.8" />
        ) : null;
      })}
    </svg>
  );
}

// ─── Camera QR Scanner ────────────────────────────────────────────────────
const CameraQRScanner = ({ onScan, onClose }: { onScan: (link: string) => void; onClose: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
        tick();
      })
      .catch(() => setError("Camera access denied"));

    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !active) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code?.data) {
            const match = code.data.match(/^RESTAURANT_LOYALTY:(.+)$/);
            if (match) { onScan(match[1]); return; }
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [onScan]);

  if (error) return (
    <div style={{ textAlign: "center", paddingBlock: 32 }}>
      <p style={{ color: "#f87171", fontSize: 15 }}>{error}</p>
      <button onClick={onClose} style={{ marginTop: 12, color: "rgba(255,255,255,0.5)", fontSize: 14, background: "none", border: "none", cursor: "pointer" }}>Close</button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{
        position: "relative", width: "100%", maxWidth: "min(280px, 80vw)",
        borderRadius: 20, overflow: "hidden", background: "#000", aspectRatio: "1/1",
      }}>
        <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ position: "relative", width: "65%", height: "65%" }}>
            {[
              { top: 0, left: 0, borderTop: "2px solid rgba(255,255,255,0.85)", borderLeft: "2px solid rgba(255,255,255,0.85)", borderRadius: "4px 0 0 0" },
              { top: 0, right: 0, borderTop: "2px solid rgba(255,255,255,0.85)", borderRight: "2px solid rgba(255,255,255,0.85)", borderRadius: "0 4px 0 0" },
              { bottom: 0, left: 0, borderBottom: "2px solid rgba(255,255,255,0.85)", borderLeft: "2px solid rgba(255,255,255,0.85)", borderRadius: "0 0 0 4px" },
              { bottom: 0, right: 0, borderBottom: "2px solid rgba(255,255,255,0.85)", borderRight: "2px solid rgba(255,255,255,0.85)", borderRadius: "0 0 4px 0" },
            ].map((s, i) => (
              <div key={i} style={{ position: "absolute", width: 28, height: 28, ...s }} />
            ))}
            <motion.div
              style={{ position: "absolute", left: 4, right: 4, height: 2, background: "rgba(255,255,255,0.7)", borderRadius: 999 }}
              animate={{ top: ["10%", "85%", "10%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, fontFamily: "monospace", textAlign: "center" }}>
        Scan the restaurant QR code
      </p>
    </div>
  );
};

// ─── Wallet Card ──────────────────────────────────────────────────────────
const WalletCardItem = ({
  card, isActive, flipped, onFlip, cardWidth,
}: {
  card: LoyaltyCard; index: number; isActive: boolean; flipped: boolean;
  onFlip: (e: React.MouseEvent) => void; cardWidth: number;
}) => {
  const bgColor = (card as any).cardBgColor || "#c5e840";
  const featuredDish = (card as any).featuredDish || card.brandName;
  const featuredDishImage = (card as any).featuredDishImage || "";
  const featuredDishMeta = (card as any).featuredDishMeta || "";
  const category = (card as any).category || "";
  const pct = Math.min(100, Math.round((card.pointsBalance / 3000) * 100));

  const isDark = (() => {
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
  })();
  const textDark = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
  const textMuted = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)";
  const overlayBg = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
  const qrSectionBg = isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)";
  const qrSectionBorder = isDark ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)";
  const barTrack = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
  const barFill = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.55)";

  const heroH = Math.round(cardWidth * 0.52);
  const qrSize = Math.round(cardWidth * 0.17);
  const iconSize = Math.round(cardWidth * 0.1);
  const padH = Math.round(cardWidth * 0.052);
  const padV = Math.round(cardWidth * 0.044);

  // fs() = proportional size with a hard minimum for readability
  const fs = (ratio: number, floor: number) => Math.max(floor, Math.round(cardWidth * ratio));

  return (
    <div
      onClick={onFlip}
      style={{
        width: cardWidth, flexShrink: 0, cursor: "pointer",
        userSelect: "none", WebkitUserSelect: "none",
        transition: "transform 0.3s ease, opacity 0.3s ease, filter 0.3s ease",
        transform: isActive ? "scale(1)" : "scale(0.88)",
        opacity: isActive ? 1 : 0.5,
        filter: isActive ? "none" : "blur(0.5px)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div style={{
        position: "relative", transformStyle: "preserve-3d",
        transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1)",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        borderRadius: 28,
        boxShadow: isActive
          ? "0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)"
          : "0 10px 30px rgba(0,0,0,0.3)",
      }}>
        {/* ── FRONT ── */}
        <div style={{
          backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" as any,
          borderRadius: 28, overflow: "hidden", background: bgColor,
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${padV}px ${padH}px` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0, flex: 1 }}>
              <div style={{
                width: iconSize, height: iconSize, minWidth: iconSize,
                borderRadius: Math.round(iconSize * 0.3), background: overlayBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: Math.round(iconSize * 0.52), overflow: "hidden",
              }}>
                {card.logoUrl
                  ? <img src={card.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : card.brandIcon}
              </div>
              <span style={{
                fontWeight: 700, fontSize: fs(0.048, 15), color: textDark,
                letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {card.brandName}
              </span>
            </div>
            {category && (
              <span style={{
                background: overlayBg, borderRadius: 999, padding: `3px ${Math.round(padH * 0.6)}px`,
                fontSize: fs(0.036, 12), color: textMuted, fontWeight: 500,
                flexShrink: 0, marginLeft: 6, maxWidth: "32%",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {category}
              </span>
            )}
          </div>

          {/* Hero image */}
          <div style={{ width: "100%", height: heroH, position: "relative", background: overlayBg, overflow: "hidden" }}>
            {featuredDishImage ? (
              <img src={featuredDishImage} alt={featuredDish} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(cardWidth * 0.18) }}>
                {card.brandIcon}
              </div>
            )}
            <div style={{
              position: "absolute", top: 8, right: 8,
              background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)",
              borderRadius: 999, padding: `4px ${Math.round(padH * 0.55)}px`,
              fontSize: fs(0.036, 12), color: "rgba(255,255,255,0.85)",
              fontFamily: "monospace", border: "1px solid rgba(255,255,255,0.15)",
            }}>
              {card.visitCount} visits
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: `${padV}px ${padH}px ${Math.round(padV * 1.2)}px` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{
                fontWeight: 700, fontSize: fs(0.052, 16), color: textDark,
                letterSpacing: "-0.03em", lineHeight: 1.2,
                maxWidth: "58%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {featuredDish || card.brandName}
              </div>
              {featuredDishMeta && (
                <div style={{
                  fontSize: fs(0.036, 12), color: textMuted,
                  textAlign: "right", lineHeight: 1.4,
                  maxWidth: "38%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {featuredDishMeta}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: fs(0.036, 12), color: textMuted, marginBottom: 4 }}>
                <span>Points balance</span>
                <span style={{ fontWeight: 700, color: textDark, fontSize: fs(0.038, 13) }}>
                  {card.pointsBalance.toLocaleString()} / 3,000
                </span>
              </div>
              <div style={{ height: 4, borderRadius: 999, background: barTrack, overflow: "hidden" }}>
                <motion.div
                  style={{ height: "100%", borderRadius: 999, background: barFill }}
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.1, duration: 0.8 }}
                />
              </div>
            </div>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: qrSectionBg, border: `1px solid ${qrSectionBorder}`,
              borderRadius: 14, padding: `${Math.round(padV * 0.65)}px ${Math.round(padH * 0.75)}px`,
            }}>
              <div>
                <div style={{ fontSize: fs(0.038, 13), fontWeight: 600, color: textDark, marginBottom: 2 }}>Scan at cashier</div>
                <div style={{ fontSize: fs(0.034, 12), color: textMuted }}>Show to earn points</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 8, padding: 3, border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", flexShrink: 0 }}>
                <MiniQR value={`LOYALTY:${card.id}`} size={qrSize} />
              </div>
            </div>
          </div>
        </div>

        {/* ── BACK ── */}
        <div style={{
          position: "absolute", inset: 0,
          backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" as any,
          transform: "rotateY(180deg)", borderRadius: 28,
          background: "#0f0f10", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 14, padding: 24,
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
          <div style={{ color: "#fff", fontSize: fs(0.05, 16), fontWeight: 700 }}>{card.brandName}</div>
          <div style={{ padding: 14, background: "#fff", borderRadius: 14, boxShadow: `0 0 30px ${bgColor}60` }}>
            <MiniQR value={`LOYALTY:${card.id}:${card.brandName}`} size={Math.round(cardWidth * 0.44)} />
          </div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "monospace", letterSpacing: "0.08em" }}>SCAN AT CASHIER</div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "monospace" }}>
            #{card.id.slice(-8).toUpperCase()}
          </div>
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, fontFamily: "monospace" }}>tap to close</div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Index ───────────────────────────────────────────────────────────
const Index = () => {
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const dragDelta = useRef(0);
  // Refs to avoid stale closures in event handlers
  const currentIdxRef = useRef(0);
  const cardWidthRef = useRef(0);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const GAP = 16;

  /**
   * Centering formula:
   *   offset = (containerWidth - cardWidth) / 2  - idx * (cardWidth + GAP)
   *
   * This places card[0] centered, card[1] one step to the right, etc.
   * The track has NO padding — centering is done purely via translateX.
   */
  const getOffset = (idx: number) => {
    const cw = cardWidthRef.current;
    const wrapW = containerRef.current?.offsetWidth ?? window.innerWidth;
    return (wrapW - cw) / 2 - idx * (cw + GAP);
  };

  const applyOffset = (idx: number, animate = true) => {
    if (!trackRef.current) return;
    if (!animate) trackRef.current.style.transition = "none";
    trackRef.current.style.transform = `translateX(${getOffset(idx)}px)`;
    if (!animate) {
      requestAnimationFrame(() => {
        if (trackRef.current) trackRef.current.style.transition = "";
      });
    }
  };

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const w = Math.min(400, Math.max(280, Math.round(vw * 0.88)));
      cardWidthRef.current = w;
      setCardWidth(w);
      applyOffset(currentIdxRef.current, false);
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", calc);
    return () => { window.removeEventListener("resize", calc); ro.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const DRAG_THRESHOLD = 40;

  useEffect(() => {
    loyaltyApi.myCards()
      .then((data) => setCards(data.map(mapCard)))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);

  // Re-apply offset when cardWidth is first set or changes
  useEffect(() => {
    if (cardWidth > 0) applyOffset(currentIdx, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardWidth]);

  const snapTo = (idx: number, total: number) => {
    const clamped = Math.max(0, Math.min(total - 1, idx));
    currentIdxRef.current = clamped;
    setCurrentIdx(clamped);
    setFlipped({});
    applyOffset(clamped);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true; dragDelta.current = 0; startX.current = e.clientX; e.preventDefault();
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    dragDelta.current = e.clientX - startX.current;
    trackRef.current.style.transition = "none";
    trackRef.current.style.transform = `translateX(${getOffset(currentIdxRef.current) + dragDelta.current}px)`;
  };
  const onMouseUp = (total: number) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragDelta.current < -DRAG_THRESHOLD) snapTo(currentIdxRef.current + 1, total);
    else if (dragDelta.current > DRAG_THRESHOLD) snapTo(currentIdxRef.current - 1, total);
    else snapTo(currentIdxRef.current, total);
  };
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX; dragDelta.current = 0;
    if (trackRef.current) trackRef.current.style.transition = "none";
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!trackRef.current) return;
    dragDelta.current = e.touches[0].clientX - startX.current;
    trackRef.current.style.transform = `translateX(${getOffset(currentIdxRef.current) + dragDelta.current}px)`;
  };
  const onTouchEnd = (total: number) => {
    if (trackRef.current) trackRef.current.style.transition = "";
    if (dragDelta.current < -DRAG_THRESHOLD) snapTo(currentIdxRef.current + 1, total);
    else if (dragDelta.current > DRAG_THRESHOLD) snapTo(currentIdxRef.current - 1, total);
    else snapTo(currentIdxRef.current, total);
  };

  const openAddDialog = () => { setScanSuccess(null); setScanMode(true); setShowAddDialog(true); };

  const handleQRScanned = async (registerLink: string) => {
    setScanMode(false); setScanSuccess(registerLink); setJoining(true);
    try {
      const card = await loyaltyApi.join(undefined, registerLink);
      setCards((prev) => {
        const next = [...prev, mapCard(card)];
        const newIdx = next.length - 1;
        currentIdxRef.current = newIdx;
        setCurrentIdx(newIdx);
        requestAnimationFrame(() => applyOffset(newIdx));
        return next;
      });
      toast.success("Joined loyalty program! 🎉");
      setTimeout(() => setShowAddDialog(false), 1500);
    } catch (err: any) {
      toast.error(err.message); setScanSuccess(null); setScanMode(true);
    } finally {
      setJoining(false);
    }
  };

  const activeCard = cards[currentIdx];
  const activeBg = (activeCard as any)?.cardBgColor ?? "#c5e840";

  return (
    <div style={{
      minHeight: "100vh", minHeight: "100dvh" as any,
      background: "#080809", fontFamily: "'DM Sans', system-ui, sans-serif",
      position: "relative", overflowX: "hidden",
    }}>
      {activeCard && (
        <div style={{
          position: "fixed", top: -100, left: "50%", transform: "translateX(-50%)",
          width: "min(500px, 150vw)", height: "min(500px, 150vw)", borderRadius: "50%",
          background: `radial-gradient(circle, ${activeBg}28 0%, transparent 70%)`,
          transition: "background 0.6s ease", pointerEvents: "none", zIndex: 0,
        }} />
      )}

      {/* ── Header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(8,8,9,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingTop: "max(14px, env(safe-area-inset-top, 0px))",
        paddingBottom: 14,
        paddingLeft: "max(16px, env(safe-area-inset-left, 0px))",
        paddingRight: "max(16px, env(safe-area-inset-right, 0px))",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: "-0.03em" }}>Wallet</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, fontFamily: "monospace" }}>
            {cards.length} loyalty {cards.length === 1 ? "card" : "cards"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {user?.role === "admin" && (
            <Link to="/admin">
              <button style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}>
                <Settings className="w-4 h-4" />
              </button>
            </Link>
          )}
          <button
            onClick={() => { logout(); navigate("/login"); }}
            style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ position: "relative", zIndex: 1, paddingTop: 28, paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
            <div style={{ width: 28, height: 28, border: `2px solid ${activeBg}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : cards.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", paddingTop: 80, paddingInline: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🃏</div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, marginBottom: 24 }}>No loyalty cards yet</p>
            <button onClick={openAddDialog} style={{
              background: "linear-gradient(135deg, #c8f03c, #7a9e10)", border: "none", borderRadius: 14,
              padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer",
              color: "#1a1a1a", display: "inline-flex", alignItems: "center", gap: 8,
              WebkitTapHighlightColor: "transparent", fontFamily: "inherit",
            }}>
              <Camera className="w-4 h-4" /> Scan QR Code
            </button>
          </motion.div>
        ) : (
          <>
            {/* ── Carousel ──
                NO paddingLeft/paddingRight on the track.
                Card[0] is centered by transform = (containerWidth - cardWidth) / 2.
                Subsequent cards are offset by multiples of (cardWidth + GAP).
            */}
            <div
              ref={containerRef}
              style={{ overflow: "hidden", width: "100%", touchAction: "pan-y" }}
              onMouseLeave={() => onMouseUp(cards.length)}
            >
              <div
                ref={trackRef}
                style={{
                  display: "flex", gap: GAP, cursor: "grab",
                  willChange: "transform", alignItems: "flex-start",
                  transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1)",
                }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={() => onMouseUp(cards.length)}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={() => onTouchEnd(cards.length)}
              >
                {cards.map((card, i) => (
                  <WalletCardItem
                    key={card.id} card={card} index={i}
                    isActive={i === currentIdx}
                    flipped={!!flipped[card.id]}
                    cardWidth={cardWidth || 300}
                    onFlip={(e) => {
                      e.stopPropagation();
                      if (Math.abs(dragDelta.current) > 5) return;
                      if (i !== currentIdx) { snapTo(i, cards.length); return; }
                      setFlipped((p) => ({ ...p, [card.id]: !p[card.id] }));
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ── Dots ── */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
              {cards.map((_, i) => (
                <button key={i} onClick={() => snapTo(i, cards.length)} style={{
                  height: 6, width: i === currentIdx ? 22 : 6, borderRadius: 999,
                  background: i === currentIdx ? activeBg : "rgba(255,255,255,0.2)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "all 0.25s ease", WebkitTapHighlightColor: "transparent",
                  minHeight: 22, display: "flex", alignItems: "center",
                }} />
              ))}
            </div>

            {/* ── Stats ── */}
            {activeCard && (
              <div style={{ margin: "20px auto 0", paddingInline: 16, maxWidth: 460, width: "100%", boxSizing: "border-box" }}>
                <div style={{ borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: 16 }}>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                    Card Summary
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {[
                      { label: "Points", value: activeCard.pointsBalance.toLocaleString() },
                      { label: "Visits", value: activeCard.visitCount },
                      { label: "Progress", value: `${Math.min(100, Math.round((activeCard.pointsBalance / 3000) * 100))}%` },
                    ].map((stat) => (
                      <div key={stat.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "12px 8px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: "-0.03em" }}>{stat.value}</div>
                        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "monospace", marginTop: 3 }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{
                  marginTop: 12, borderRadius: 20,
                  background: `${activeBg}18`, border: `1px solid ${activeBg}30`,
                  padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                      Member since
                    </div>
                    <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>
                      {new Date(activeCard.joinDate).toLocaleDateString("en", { month: "long", year: "numeric" })}
                    </div>
                  </div>
                  <div style={{ width: 44, height: 44, minWidth: 44, borderRadius: 14, background: activeBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                    {activeCard.brandIcon}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── FAB ── */}
      {cards.length > 0 && (
        <div style={{ position: "fixed", bottom: "calc(24px + env(safe-area-inset-bottom, 0px))", right: "max(20px, env(safe-area-inset-right, 0px))", zIndex: 20 }}>
          <button onClick={openAddDialog} style={{
            width: 56, height: 56, borderRadius: "50%", background: activeBg, border: "none",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 8px 24px ${activeBg}55`, color: "#000",
            WebkitTapHighlightColor: "transparent",
          }}>
            <Camera className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ── Add Dialog ── */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) { setScanMode(false); setScanSuccess(null); } }}>
        <DialogContent style={{
          background: "#0f0f10", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24,
          maxWidth: "min(360px, calc(100vw - 32px))", width: "calc(100vw - 32px)", margin: "0 auto",
        }}>
          <DialogHeader>
            <DialogTitle style={{ color: "#fff", fontWeight: 700 }}>Add New Card</DialogTitle>
          </DialogHeader>
          <AnimatePresence mode="wait">
            {scanSuccess && !joining ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingBlock: 24 }}>
                <CheckCircle2 style={{ width: 52, height: 52, color: "#4ade80" }} />
                <p style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>Joined successfully!</p>
              </motion.div>
            ) : joining ? (
              <motion.div key="joining" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingBlock: 32 }}>
                <div style={{ width: 28, height: 28, border: "2px solid #c8f03c", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "monospace" }}>Joining...</p>
              </motion.div>
            ) : scanMode ? (
              <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <CameraQRScanner onScan={handleQRScanned} onClose={() => setShowAddDialog(false)} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;