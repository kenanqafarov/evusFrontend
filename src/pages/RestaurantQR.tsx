import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download } from "lucide-react";
import QRCodeLib from "qrcode";
import { restaurants as restaurantsApi, ApiRestaurant } from "@/api";
import { toast } from "sonner";

const CARD_GRADIENTS: [string, string][] = [
  ["#c8f03c", "#7a9e10"],
  ["#f59e0b", "#b45309"],
  ["#a78bfa", "#6d28d9"],
  ["#34d399", "#059669"],
  ["#f87171", "#dc2626"],
  ["#60a5fa", "#2563eb"],
];

const RestaurantQRView = ({
  restaurant, qrValue, size, onBack,
}: {
  restaurant: ApiRestaurant; qrValue: string; size: number; onBack: () => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientIdx = restaurant.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % CARD_GRADIENTS.length;
  const [g1, g2] = CARD_GRADIENTS[gradientIdx];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCodeLib.toCanvas(canvas, qrValue, {
      width: size, margin: 2,
      color: { dark: "#1a1a1a", light: "#ffffff" },
      errorCorrectionLevel: "H",
    }).then(() => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const logoSize = size * 0.22;
      const lx = (size - logoSize) / 2;
      const ly = (size - logoSize) / 2;
      const r = logoSize * 0.22;
      ctx.save();
      ctx.beginPath();
      (ctx as any).roundRect(lx - 5, ly - 5, logoSize + 10, logoSize + 10, r + 3);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();
      if (restaurant.logoUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          (ctx as any).roundRect(lx, ly, logoSize, logoSize, r);
          ctx.clip();
          ctx.drawImage(img, lx, ly, logoSize, logoSize);
          ctx.restore();
        };
        img.src = restaurant.logoUrl;
      } else if (restaurant.icon) {
        ctx.save();
        ctx.beginPath();
        (ctx as any).roundRect(lx, ly, logoSize, logoSize, r);
        ctx.fillStyle = "#f5f5f5";
        ctx.fill();
        ctx.font = `${logoSize * 0.62}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(restaurant.icon, lx + logoSize / 2, ly + logoSize / 2);
        ctx.restore();
      }
    });
  }, [qrValue, restaurant, size]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `loyalty-qr-${restaurant.registerLink}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div style={{
      minHeight: "100vh",
      minHeight: "100dvh" as any,
      background: "#080809",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: "#fff",
      position: "relative",
      overflowX: "hidden",
    }}>
      {/* BG glow */}
      <div style={{
        position: "fixed", top: -100, left: "50%", transform: "translateX(-50%)",
        width: "min(500px, 140vw)", height: "min(500px, 140vw)", borderRadius: "50%",
        background: `radial-gradient(circle, ${g1}18 0%, transparent 70%)`,
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Header ── */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "rgba(8,8,9,0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingTop: "max(14px, env(safe-area-inset-top, 0px))",
        paddingBottom: 14,
        paddingLeft: "max(16px, env(safe-area-inset-left, 0px))",
        paddingRight: "max(16px, env(safe-area-inset-right, 0px))",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 44, height: 44,
            minWidth: 44,
            borderRadius: 10,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "clamp(14px, 4.5vw, 16px)", letterSpacing: "-0.02em" }}>
            Loyalty QR Code
          </div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "clamp(10px, 3vw, 11px)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {restaurant.name}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "clamp(24px, 7vw, 40px) clamp(16px, 5vw, 24px)",
        paddingBottom: "calc(clamp(24px, 7vw, 40px) + env(safe-area-inset-bottom, 0px))",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "clamp(16px, 5vw, 24px)",
        position: "relative",
        zIndex: 1,
        boxSizing: "border-box",
      }}>
        {/* Restaurant info */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", gap: 14 }}
        >
          {restaurant.logoUrl ? (
            <img src={restaurant.logoUrl} alt={restaurant.name} style={{
              width: "clamp(44px, 13vw, 56px)",
              height: "clamp(44px, 13vw, 56px)",
              minWidth: "clamp(44px, 13vw, 56px)",
              borderRadius: 16,
              objectFit: "cover",
              border: "1px solid rgba(255,255,255,0.1)",
            }} />
          ) : (
            <div style={{
              width: "clamp(44px, 13vw, 56px)",
              height: "clamp(44px, 13vw, 56px)",
              minWidth: "clamp(44px, 13vw, 56px)",
              borderRadius: 16,
              background: `linear-gradient(135deg, ${g1}30, ${g2}20)`,
              border: `1px solid ${g1}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "clamp(22px, 7vw, 28px)",
            }}>
              {restaurant.icon}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: "clamp(16px, 5vw, 20px)", letterSpacing: "-0.03em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {restaurant.name}
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "clamp(10px, 3vw, 12px)", fontFamily: "monospace", marginTop: 3 }}>
              Loyalty Program
            </div>
          </div>
        </motion.div>

        {/* QR Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 22 }}
          style={{
            borderRadius: 28,
            overflow: "hidden",
            position: "relative",
            // Responsive width: fills available space up to size + padding
            width: "100%",
            maxWidth: Math.min(320, size + 48),
          }}
        >
          <div style={{
            position: "absolute", inset: -1, borderRadius: 29,
            background: `linear-gradient(135deg, ${g1}60, ${g2}40)`, zIndex: -1,
          }} />
          <div style={{
            background: "#fff",
            borderRadius: 28,
            padding: "clamp(14px, 4vw, 24px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}>
            <canvas
              ref={canvasRef}
              width={size}
              height={size}
              style={{
                borderRadius: 10,
                display: "block",
                width: "100%",
                height: "auto",
                maxWidth: size,
              }}
            />
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#888", fontSize: 12, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>
                Customer scan to join
              </p>
              <p style={{ color: "#bbb", fontSize: 11, fontFamily: "monospace", margin: 0, wordBreak: "break-all" }}>
                {restaurant.registerLink}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            borderRadius: 20,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "clamp(12px, 4vw, 18px) clamp(14px, 5vw, 20px)",
            maxWidth: 320,
            width: "100%",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "clamp(12px, 3.5vw, 13px)", textAlign: "center", lineHeight: 1.6, margin: 0 }}>
            Customers tap <strong style={{ color: "#fff" }}>+</strong> in the app and scan this QR code to automatically join <strong style={{ color: "#fff" }}>{restaurant.name}'s</strong> loyalty program.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", maxWidth: 320 }}
        >
          {[
            { label: "Register URL", value: `/${restaurant.registerLink}`, mono: true },
            { label: "QR Format", value: "RESTAURANT_LOYALTY", mono: true },
          ].map((item) => (
            <div key={item.label} style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 14,
              padding: "clamp(10px, 3vw, 12px) clamp(10px, 3vw, 14px)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                {item.label}
              </div>
              <div style={{
                color: "#fff",
                fontSize: 11,
                fontFamily: item.mono ? "monospace" : "inherit",
                wordBreak: "break-all",
                overflowWrap: "break-word",
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Download */}
        <button onClick={handleDownload} style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 14,
          padding: "clamp(10px, 3vw, 12px) clamp(20px, 6vw, 28px)",
          fontSize: "clamp(13px, 4vw, 14px)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "inherit",
          fontWeight: 500,
          WebkitTapHighlightColor: "transparent",
          minHeight: 44,
        }}>
          <Download className="w-4 h-4" /> Download QR PNG
        </button>
      </div>
    </div>
  );
};

const RestaurantQRPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<ApiRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrSize, setQrSize] = useState(240);

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      // QR canvas: fills up to 55vw, min 160, max 240
      setQrSize(Math.min(240, Math.max(160, Math.round(vw * 0.55))));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    if (!id) return;
    restaurantsApi.getById(id)
      .then(setRestaurant)
      .catch((err) => { toast.error(err.message); navigate("/admin"); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !restaurant) {
    return (
      <div style={{ minHeight: "100vh", background: "#080809", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "2px solid #c8f03c", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const qrValue = `RESTAURANT_LOYALTY:${restaurant.registerLink}`;
  return <RestaurantQRView restaurant={restaurant} qrValue={qrValue} size={qrSize} onBack={() => navigate(-1)} />;
};

export default RestaurantQRPage;