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
      className="w-full max-w-[360px] rounded-2xl overflow-hidden wallet-card-shadow"
      style={{
        background: `linear-gradient(160deg, ${card.gradientFrom}, ${card.gradientTo})`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center text-xl shadow-sm">
          {card.brandIcon}
        </div>
        <span className="font-semibold text-base text-black/80">{card.brandName}</span>
        <span className="ml-auto text-sm text-black/50 font-medium">{card.tagline}</span>
      </div>

      {/* Hero Image */}
      <div className="px-0">
        <img
          src={heroSrc}
          alt={card.brandName}
          className="w-full h-48 object-cover"
        />
      </div>

      {/* Info Section */}
      <div className="px-5 pt-4 pb-3 flex items-end justify-between">
        <div>
          <p className="text-lg font-semibold text-black/80 leading-tight max-w-[180px]">
            {card.description}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-black/50 font-medium">{card.dateLabel}</p>
          {card.dateValue && (
            <p className="text-lg font-semibold text-black/80">{card.dateValue}</p>
          )}
        </div>
      </div>

      {/* QR Code */}
      <div className="flex justify-center py-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <QRCodeSVG
            value={card.qrValue}
            size={120}
            level="M"
            bgColor="white"
            fgColor="black"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default WalletCard;
