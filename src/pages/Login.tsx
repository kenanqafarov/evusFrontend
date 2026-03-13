import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockUsers } from "@/data/mockUsers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = mockUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (!found) {
      toast.error("İstifadəçi adı və ya şifrə yanlışdır");
      return;
    }
    login(found);
    toast.success(`Xoş gəldiniz, ${found.username}!`);
    navigate(found.type === "admin" ? "/admin" : "/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
          <p className="text-muted-foreground text-sm mt-1">Daxil olun</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">İstifadəçi adı</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifrə</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Daxil ol
          </Button>
        </form>

        {/* Mock credentials hint */}
        <div className="mt-6 p-3 rounded-lg bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Test hesabları:</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p><span className="text-foreground font-medium">Admin:</span> admin / admin123</p>
            <p><span className="text-foreground font-medium">User:</span> user / user123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
