import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { LoyaltyCard } from "@/types/card";
import WalletCard from "./WalletCard";

interface CardEditorProps {
  card?: LoyaltyCard | null;
  onSave: (card: LoyaltyCard) => void;
  onCancel: () => void;
}

const defaultCard: LoyaltyCard = {
  id: "",
  brandName: "",
  brandIcon: "🏪",
  tagline: "",
  heroImage: "",
  description: "",
  dateLabel: "",
  dateValue: "",
  gradientFrom: "#d4e157",
  gradientTo: "#c0ca33",
  qrValue: "https://example.com",
};

const CardEditor = ({ card, onSave, onCancel }: CardEditorProps) => {
  const [form, setForm] = useState<LoyaltyCard>(card || { ...defaultCard, id: crypto.randomUUID() });

  useEffect(() => {
    if (card) setForm(card);
  }, [card]);

  const update = (key: keyof LoyaltyCard, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {card ? "Kartı Redaktə Et" : "Yeni Kart Yarat"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Brend Adı</Label>
            <Input value={form.brandName} onChange={(e) => update("brandName", e.target.value)} placeholder="Slice Society" />
          </div>
          <div className="space-y-2">
            <Label>Brend İkonu (emoji)</Label>
            <Input value={form.brandIcon} onChange={(e) => update("brandIcon", e.target.value)} placeholder="🍕" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Şüar</Label>
          <Input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Cheesy pizza slice" />
        </div>

        <div className="space-y-2">
          <Label>Şəkil URL</Label>
          <Input value={form.heroImage} onChange={(e) => update("heroImage", e.target.value)} placeholder="https://..." />
        </div>

        <div className="space-y-2">
          <Label>Təsvir</Label>
          <Input value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Buffalo chicken pizza" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tarix Etiketi</Label>
            <Input value={form.dateLabel} onChange={(e) => update("dateLabel", e.target.value)} placeholder="Saturday & Sunday only" />
          </div>
          <div className="space-y-2">
            <Label>Tarix Dəyəri</Label>
            <Input value={form.dateValue} onChange={(e) => update("dateValue", e.target.value)} placeholder="03/05/25" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Gradient Başlanğıc</Label>
            <div className="flex gap-2">
              <input type="color" value={form.gradientFrom} onChange={(e) => update("gradientFrom", e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
              <Input value={form.gradientFrom} onChange={(e) => update("gradientFrom", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Gradient Son</Label>
            <div className="flex gap-2">
              <input type="color" value={form.gradientTo} onChange={(e) => update("gradientTo", e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
              <Input value={form.gradientTo} onChange={(e) => update("gradientTo", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>QR Kod Dəyəri</Label>
          <Input value={form.qrValue} onChange={(e) => update("qrValue", e.target.value)} placeholder="https://example.com/loyalty" />
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={() => onSave(form)} className="flex-1">
            Yadda Saxla
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Ləğv Et
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-sm font-medium text-muted-foreground">Canlı Önizləmə</h3>
        <div className="p-6 rounded-2xl bg-muted/30">
          <WalletCard card={form} />
        </div>
      </div>
    </div>
  );
};

export default CardEditor;
