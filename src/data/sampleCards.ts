import type { LoyaltyCard, Restaurant, CustomerUser } from "@/types/card";

export const sampleRestaurants: Restaurant[] = [
  {
    id: "r1",
    name: "Slice Society",
    icon: "🍕",
    registerLink: "",
    createdAt: "2025-01-15",
  },
  {
    id: "r2",
    name: "Coffeeshop",
    icon: "☕",
    registerLink: "",
    createdAt: "2025-02-01",
  },
  {
    id: "r3",
    name: "Bali Escape",
    icon: "🌴",
    registerLink: "",
    createdAt: "2025-03-01",
  },
];

export const sampleCards: LoyaltyCard[] = [
  {
    id: "1",
    restaurantId: "r1",
    brandName: "Slice Society",
    brandIcon: "🍕",
    tagline: "Cheesy pizza slice",
    heroImage: "",
    description: "Buffalo chicken pizza",
    dateLabel: "Saturday & Sunday only",
    dateValue: "",
    gradientFrom: "#d4e157",
    gradientTo: "#c0ca33",
    qrValue: "https://slicesociety.com/loyalty",
  },
  {
    id: "2",
    restaurantId: "r2",
    brandName: "Coffeeshop",
    brandIcon: "☕",
    tagline: "Your morning fix",
    heroImage: "",
    description: "Try our new pistachio latte",
    dateLabel: "Available until:",
    dateValue: "03/05/25",
    gradientFrom: "#f8bbd0",
    gradientTo: "#ce93d8",
    qrValue: "https://coffeeshop.com/loyalty",
  },
  {
    id: "3",
    restaurantId: "r3",
    brandName: "Bali Escape",
    brandIcon: "🌴",
    tagline: "Paradise awaits",
    heroImage: "",
    description: "7 nights, All-Inclusive",
    dateLabel: "Next Departure:",
    dateValue: "05/10/25",
    gradientFrom: "#7e57c2",
    gradientTo: "#5c6bc0",
    qrValue: "https://baliescape.com/loyalty",
  },
];

export const sampleCustomers: CustomerUser[] = [
  {
    id: "u1",
    username: "ali_m",
    fullName: "Əli Məmmədov",
    email: "ali@example.com",
    registeredAt: "2025-01-20",
    loyaltyCards: ["1", "2"],
  },
  {
    id: "u2",
    username: "aysel_h",
    fullName: "Aysel Həsənova",
    email: "aysel@example.com",
    registeredAt: "2025-02-10",
    loyaltyCards: ["2", "3"],
  },
  {
    id: "u3",
    username: "tural_r",
    fullName: "Tural Rəhimov",
    email: "tural@example.com",
    registeredAt: "2025-03-01",
    loyaltyCards: ["1"],
  },
];
