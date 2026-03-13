import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WalletCard from "@/components/WalletCard";
import CardEditor from "@/components/CardEditor";
import type { LoyaltyCard } from "@/types/card";
import { sampleCards } from "@/data/sampleCards";
import { toast } from "sonner";

const Admin = () => {
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [editing, setEditing] = useState<LoyaltyCard | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("wallet-cards");
    if (stored) {
      setCards(JSON.parse(stored));
    } else {
      setCards(sampleCards);
    }
  }, []);

  const save = (updated: LoyaltyCard[]) => {
    setCards(updated);
    localStorage.setItem("wallet-cards", JSON.stringify(updated));
  };

  const handleSave = (card: LoyaltyCard) => {
    const exists = cards.find((c) => c.id === card.id);
    if (exists) {
      save(cards.map((c) => (c.id === card.id ? card : c)));
      toast.success("Kart yeniləndi");
    } else {
      save([...cards, card]);
      toast.success("Yeni kart əlavə edildi");
    }
    setEditing(null);
    setCreating(false);
  };

  const handleDelete = (id: string) => {
    save(cards.filter((c) => c.id !== id));
    toast.success("Kart silindi");
  };

  const showEditor = editing || creating;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-effect bg-background/80 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
          </div>
          {!showEditor && (
            <Button
              size="sm"
              onClick={() => setCreating(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Yeni Kart
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {showEditor ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CardEditor
                card={editing}
                onSave={handleSave}
                onCancel={() => {
                  setEditing(null);
                  setCreating(false);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {cards.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">Heç bir kart yoxdur</p>
                  <Button onClick={() => setCreating(true)} className="mt-4 gap-2">
                    <Plus className="w-4 h-4" /> İlk kartınızı yaradın
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cards.map((card, i) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative group"
                    >
                      <WalletCard card={card} index={0} />
                      {/* Action Buttons Overlay */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditing(card)}
                          className="w-9 h-9 rounded-full bg-black/60 glass-effect flex items-center justify-center hover:bg-black/80 transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleDelete(card.id)}
                          className="w-9 h-9 rounded-full bg-red-500/80 glass-effect flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
