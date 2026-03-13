export interface LoyaltyCard {
  id: string;
  restaurantId: string;
  brandName: string;
  brandIcon: string;
  tagline: string;
  heroImage: string;
  description: string;
  dateLabel: string;
  dateValue: string;
  gradientFrom: string;
  gradientTo: string;
  qrValue: string;
}

export interface Restaurant {
  id: string;
  name: string;
  icon: string;
  registerLink: string;
  createdAt: string;
}

export interface CustomerUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  registeredAt: string;
  loyaltyCards: string[]; // card IDs
}
