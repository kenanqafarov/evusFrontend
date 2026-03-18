import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import type { LoyaltyCard } from "@/types/card";
import pizzaImg from "@/assets/pizza.jpg";
import coffeeImg from "@/assets/coffee.jpg";
import baliImg from "@/assets/bali.jpg";

const fallbackImages: Record<string, string> = {
  "1": pizzaImg,
  "2": coffeeImg,
  "3": baliImg,
};

interface WalletCardProps {
  card: LoyaltyCard;
  index?: number;
}

const WalletCard = ({ card, index = 0 }: WalletCardProps) => {
  const heroSrc = card.heroImage || fallbackImages[card.id] || pizzaImg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-[360px] rounded-3xl overflow-hidden wallet-card-shadow relative"
      style={{
        background: `linear-gradient(160deg, ${card.gradientFrom}, ${card.gradientTo})`,
      }}
    >
      {/* Header (Apple Wallet header style) */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4">
        <div className="w-11 h-11 rounded-2xl bg-white/90 flex items-center justify-center text-2xl shadow-inner">
          {card.brandIcon}
        </div>
        <div className="flex-1">
          <span className="font-semibold text-lg text-black/90 tracking-tight">
            {card.brandName}
          </span>
        </div>
        <span className="text-sm text-black/50 font-medium tracking-wide">
          {card.tagline}
        </span>
      </div>

      {/* Hero Image (Apple Wallet strip/background style – tam ekran, object-cover) */}
      <div className="relative px-0">
        <img
          src={heroSrc}
          alt={card.brandName}
          className="w-full h-[220px] object-cover"
        />
        {/* Apple-style subtle dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/20" />
      </div>

      {/* Info Section (Primary + Auxiliary fields – Apple Pass style) */}
      <div className="px-6 pt-5 pb-4 flex items-end justify-between relative z-10">
        <div className="max-w-[200px]">
          <p className="text-xl font-semibold text-black/90 leading-tight tracking-tight">
            {card.description}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[1px] text-black/50 font-medium">
            {card.dateLabel}
          </p>
          {card.dateValue && (
            <p className="text-2xl font-semibold text-black/90 mt-1 tracking-tighter">
              {card.dateValue}
            </p>
          )}
        </div>
      </div>

      {/* QR Code Section – tam Apple Wallet barcode/QR stilində (white strip + centered + shadow) */}
      <div className="bg-white/95 px-6 py-7 flex justify-center border-t border-white/80">
        <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
          <QRCodeSVG
            value={card.qrValue}
            size={148}
            level="M"
            bgColor="white"
            fgColor="#1C1C1E"
            includeMargin={false}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default WalletCard;