import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Restaurant } from "@/types/card";
import { toast } from "sonner";

const Register = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("wallet-restaurants");
    if (stored) {
      const rests: Restaurant[] = JSON.parse(stored);
      const found = rests.find((r) => r.id === restaurantId);
      if (found) setRestaurant(found);
      else setNotFound(true);
    } else {
      setNotFound(true);
    }
  }, [restaurantId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    // Mock: add customer to localStorage
    const stored = localStorage.getItem("wallet-customers");
    const customers = stored ? JSON.parse(stored) : [];
    const cards = JSON.parse(localStorage.getItem("wallet-cards") || "[]");
    const restCards = cards.filter((c: any) => c.restaurantId === restaurantId);

    customers.push({
      id: crypto.randomUUID(),
      username: email.split("@")[0],
      fullName: fullName.trim(),
      email: email.trim(),
      registeredAt: new Date().toISOString().split("T")[0],
      loyaltyCards: restCards.map((c: any) => c.id),
    });

    localStorage.setItem("wallet-customers", JSON.stringify(customers));
    setSubmitted(true);
    toast.success("Uğurla qeydiyyatdan keçdiniz!");
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">Restoran tapılmadı</p>
          <Link to="/" className="text-primary hover:underline text-sm">Ana səhifəyə qayıt</Link>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {submitted ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Qeydiyyat uğurlu!</h2>
            <p className="text-muted-foreground text-sm">
              {restaurant.name} loyalty kartınız aktivdir.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-3xl">
                {restaurant.icon}
              </div>
              <h1 className="text-2xl font-bold text-foreground">{restaurant.name}</h1>
              <p className="text-muted-foreground text-sm mt-1">Loyalty müştərisi olun</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Ad Soyad</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ad Soyad"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>E-poçt</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-2">
                <CreditCard className="w-4 h-4" /> Qeydiyyatdan keç
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Register;
