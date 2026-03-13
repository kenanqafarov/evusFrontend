import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, ArrowLeft, Pencil, Trash2, Users, Store, CreditCard,
  Copy, Check, ExternalLink, LogOut, Link as LinkIcon, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import WalletCard from "@/components/WalletCard";
import CardEditor from "@/components/CardEditor";
import type { LoyaltyCard, Restaurant, CustomerUser } from "@/types/card";
import { sampleCards, sampleRestaurants, sampleCustomers } from "@/data/sampleCards";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ─── Helpers ───────────────────────────────
const loadJSON = <T,>(key: string, fallback: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
};
const saveJSON = (key: string, data: unknown) =>
  localStorage.setItem(key, JSON.stringify(data));

// ─── Component ─────────────────────────────
const Admin = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [cards, setCards] = useState<LoyaltyCard[]>(() => loadJSON("wallet-cards", sampleCards));
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => loadJSON("wallet-restaurants", sampleRestaurants));
  const [customers, setCustomers] = useState<CustomerUser[]>(() => loadJSON("wallet-customers", sampleCustomers));

  const [editing, setEditing] = useState<LoyaltyCard | null>(null);
  const [creating, setCreating] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Restaurant form
  const [newRestName, setNewRestName] = useState("");
  const [newRestIcon, setNewRestIcon] = useState("🍽️");
  const [editingRest, setEditingRest] = useState<Restaurant | null>(null);

  // Persist
  useEffect(() => saveJSON("wallet-cards", cards), [cards]);
  useEffect(() => saveJSON("wallet-restaurants", restaurants), [restaurants]);
  useEffect(() => saveJSON("wallet-customers", customers), [customers]);

  // ─── Card CRUD ───
  const handleSaveCard = (card: LoyaltyCard) => {
    const exists = cards.find((c) => c.id === card.id);
    if (exists) {
      setCards(cards.map((c) => (c.id === card.id ? card : c)));
      toast.success("Kart yeniləndi");
    } else {
      setCards([...cards, card]);
      toast.success("Yeni kart əlavə edildi");
    }
    setEditing(null);
    setCreating(false);
  };

  const handleDeleteCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
    setCustomers(customers.map((cu) => ({ ...cu, loyaltyCards: cu.loyaltyCards.filter((cid) => cid !== id) })));
    toast.success("Kart silindi");
  };

  // ─── Restaurant CRUD ───
  const generateRegisterLink = (restaurantId: string) => {
    const base = window.location.origin;
    return `${base}/register/${restaurantId}`;
  };

  const handleAddRestaurant = () => {
    if (!newRestName.trim()) return;
    const id = crypto.randomUUID();
    const rest: Restaurant = {
      id,
      name: newRestName.trim(),
      icon: newRestIcon || "🍽️",
      registerLink: generateRegisterLink(id),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setRestaurants([...restaurants, rest]);
    setNewRestName("");
    setNewRestIcon("🍽️");
    toast.success("Restoran əlavə edildi");
  };

  const handleUpdateRestaurant = (rest: Restaurant) => {
    setRestaurants(restaurants.map((r) => (r.id === rest.id ? { ...rest, registerLink: generateRegisterLink(rest.id) } : r)));
    setEditingRest(null);
    toast.success("Restoran yeniləndi");
  };

  const handleDeleteRestaurant = (id: string) => {
    setRestaurants(restaurants.filter((r) => r.id !== id));
    setCards(cards.filter((c) => c.restaurantId !== id));
    toast.success("Restoran silindi");
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    toast.success("Link kopyalandı");
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const showEditor = editing || creating;

  // ─── Render ───
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-effect bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
          </div>
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/80 transition-colors"
          >
            <LogOut className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="restaurants" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="restaurants" className="gap-2">
              <Store className="w-4 h-4" /> Restoranlar
            </TabsTrigger>
            <TabsTrigger value="cards" className="gap-2">
              <CreditCard className="w-4 h-4" /> Kartlar
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" /> İstifadəçilər
            </TabsTrigger>
          </TabsList>

          {/* ════════ RESTAURANTS TAB ════════ */}
          <TabsContent value="restaurants">
            {/* Add form */}
            <div className="p-4 rounded-xl bg-card border border-border mb-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Yeni Restoran</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2 flex-1">
                  <Input
                    value={newRestIcon}
                    onChange={(e) => setNewRestIcon(e.target.value)}
                    className="w-16 text-center text-lg"
                    placeholder="🍽️"
                  />
                  <Input
                    value={newRestName}
                    onChange={(e) => setNewRestName(e.target.value)}
                    placeholder="Restoran adı..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleAddRestaurant()}
                  />
                </div>
                <Button onClick={handleAddRestaurant} className="gap-2">
                  <Plus className="w-4 h-4" /> Əlavə et
                </Button>
              </div>
            </div>

            {restaurants.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">Heç bir restoran yoxdur</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map((rest) => {
                  const restCards = cards.filter((c) => c.restaurantId === rest.id);
                  const restCustomers = customers.filter((cu) =>
                    cu.loyaltyCards.some((cid) => restCards.some((rc) => rc.id === cid))
                  );
                  const link = rest.registerLink || generateRegisterLink(rest.id);

                  return (
                    <motion.div
                      key={rest.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-xl bg-card border border-border group hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-xl">
                            {rest.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{rest.name}</h3>
                            <p className="text-xs text-muted-foreground">{rest.createdAt}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button
                                onClick={() => setEditingRest({ ...rest })}
                                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                              >
                                <Pencil className="w-3.5 h-3.5 text-foreground" />
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Restoranı Redaktə Et</DialogTitle>
                              </DialogHeader>
                              {editingRest && (
                                <div className="space-y-4 pt-2">
                                  <div className="flex gap-2">
                                    <Input
                                      value={editingRest.icon}
                                      onChange={(e) => setEditingRest({ ...editingRest, icon: e.target.value })}
                                      className="w-16 text-center text-lg"
                                    />
                                    <Input
                                      value={editingRest.name}
                                      onChange={(e) => setEditingRest({ ...editingRest, name: e.target.value })}
                                      className="flex-1"
                                    />
                                  </div>
                                  <Button onClick={() => handleUpdateRestaurant(editingRest)} className="w-full">
                                    Yadda Saxla
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <button
                            onClick={() => handleDeleteRestaurant(rest.id)}
                            className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{restCards.length} kart</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          <span>{restCustomers.length} müştəri</span>
                        </div>
                      </div>

                      {/* Register link */}
                      <div className="p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" /> Register Link
                          </span>
                          <button
                            onClick={() => copyLink(link)}
                            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                          >
                            {copiedLink === link ? (
                              <><Check className="w-3 h-3" /> Kopyalandı</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Kopyala</>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-foreground/70 truncate font-mono">{link}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ════════ CARDS TAB ════════ */}
          <TabsContent value="cards">
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
                    onSave={handleSaveCard}
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
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-foreground font-medium">{cards.length} kart</h2>
                    <Button size="sm" onClick={() => setCreating(true)} className="gap-2">
                      <Plus className="w-4 h-4" /> Yeni Kart
                    </Button>
                  </div>
                  {cards.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="text-muted-foreground text-lg">Heç bir kart yoxdur</p>
                      <Button onClick={() => setCreating(true)} className="mt-4 gap-2">
                        <Plus className="w-4 h-4" /> İlk kartınızı yaradın
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cards.map((card, i) => {
                        const rest = restaurants.find((r) => r.id === card.restaurantId);
                        return (
                          <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative group"
                          >
                            {rest && (
                              <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span>{rest.icon}</span>
                                <span>{rest.name}</span>
                              </div>
                            )}
                            <WalletCard card={card} index={0} />
                            <div className="absolute top-10 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditing(card)}
                                className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                              >
                                <Pencil className="w-4 h-4 text-white" />
                              </button>
                              <button
                                onClick={() => handleDeleteCard(card.id)}
                                className="w-9 h-9 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* ════════ USERS TAB ════════ */}
          <TabsContent value="users">
            {customers.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">Heç bir müştəri yoxdur</div>
            ) : (
              <div className="space-y-3">
                {customers.map((cu) => {
                  const userCards = cards.filter((c) => cu.loyaltyCards.includes(c.id));
                  return (
                    <motion.div
                      key={cu.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                            {cu.fullName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{cu.fullName}</h3>
                            <p className="text-xs text-muted-foreground">@{cu.username} · {cu.email}</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Qeydiyyat: {cu.registeredAt}
                        </div>
                      </div>

                      {/* User's loyalty cards */}
                      {userCards.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-2">Loyalty kartları:</p>
                          <div className="flex flex-wrap gap-2">
                            {userCards.map((c) => (
                              <Badge
                                key={c.id}
                                variant="secondary"
                                className="gap-1.5 py-1"
                              >
                                <span>{c.brandIcon}</span>
                                {c.brandName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
