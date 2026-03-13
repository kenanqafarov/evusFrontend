import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, LogOut } from "lucide-react";
import WalletCard from "@/components/WalletCard";
import type { LoyaltyCard } from "@/types/card";
import { sampleCards } from "@/data/sampleCards";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const stored = localStorage.getItem("wallet-cards");
    if (stored) {
      setCards(JSON.parse(stored));
    } else {
      setCards(sampleCards);
      localStorage.setItem("wallet-cards", JSON.stringify(sampleCards));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-effect bg-background/80 border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Wallet</h1>
          <Link
            to="/admin"
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <Settings className="w-4 h-4 text-foreground" />
          </Link>
        </div>
      </div>

      {/* Cards Stack */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-20">
        {cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-muted-foreground text-lg">Heç bir kart yoxdur</p>
            <Link to="/admin" className="text-primary text-sm mt-2 inline-block hover:underline">
              Admin paneldən kart əlavə edin →
            </Link>
          </motion.div>
        ) : (
          cards.map((card, i) => (
            <div key={card.id} className="flex justify-center">
              <WalletCard card={card} index={i} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Index;
