const BASE_URL = import.meta.env.VITE_API_URL || "https://evus.onrender.com";

const getToken = (): string | null => localStorage.getItem("auth_token");
const setToken = (t: string) => localStorage.setItem("auth_token", t);
const clearToken = () => localStorage.removeItem("auth_token");

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Xəta baş verdi");
  return data;
}

export interface AuthUser {
  id: string;
  nickname: string;
  role: "user" | "admin";
}

export interface ApiRestaurant {
  _id: string;
  name: string;
  icon: string;
  logoUrl?: string;
  description?: string;
  address?: string;
  phone?: string;
  registerLink: string;
  createdAt: string;
}

export interface ApiLoyaltyCard {
  _id: string;
  userId: string | { _id: string; nickname: string };
  restaurantId: {
    _id: string;
    name: string;
    icon: string;
    logoUrl?: string;
    registerLink: string;
  };
  pointsBalance: number;
  visitCount: number;
  joinDate: string;
}

// Safely extract userId string regardless of populate
export const getUserId = (card: ApiLoyaltyCard): string => {
  if (typeof card.userId === "object" && card.userId !== null) {
    return card.userId._id;
  }
  return card.userId as string;
};

export const getUserNickname = (card: ApiLoyaltyCard): string => {
  if (typeof card.userId === "object" && card.userId !== null) {
    return card.userId.nickname;
  }
  return card.userId as string;
};

export const auth = {
  async register(nickname: string, password: string, adminSecret?: string) {
    const body: Record<string, string> = { nickname, password };
    if (adminSecret) body.adminSecret = adminSecret;
    const res = await apiFetch<{ success: boolean; data: { token: string; user: AuthUser } }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(body) }
    );
    setToken(res.data.token);
    return res.data;
  },

  async login(nickname: string, password: string) {
    const res = await apiFetch<{ success: boolean; data: { token: string; user: AuthUser } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ nickname, password }) }
    );
    setToken(res.data.token);
    return res.data;
  },

  logout() { clearToken(); },
  getToken,
  isLoggedIn: () => !!getToken(),
};

export const restaurants = {
  async list(): Promise<ApiRestaurant[]> {
    const res = await apiFetch<{ success: boolean; data: ApiRestaurant[] }>("/restaurants");
    return res.data;
  },

  async get(id: string): Promise<ApiRestaurant> {
    const res = await apiFetch<{ success: boolean; data: ApiRestaurant }>(`/restaurants/${id}`);
    return res.data;
  },

  async create(payload: Partial<ApiRestaurant>): Promise<ApiRestaurant> {
    const res = await apiFetch<{ success: boolean; data: ApiRestaurant }>("/admin/restaurants", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async update(id: string, payload: Partial<ApiRestaurant>): Promise<ApiRestaurant> {
    const res = await apiFetch<{ success: boolean; data: ApiRestaurant }>(
      `/admin/restaurants/${id}`,
      { method: "PUT", body: JSON.stringify(payload) }
    );
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiFetch(`/admin/restaurants/${id}`, { method: "DELETE" });
  },
};

export const loyalty = {
  async join(restaurantId?: string, registerLink?: string): Promise<ApiLoyaltyCard> {
    const body: Record<string, string> = {};
    if (restaurantId) body.restaurantId = restaurantId;
    if (registerLink) body.registerLink = registerLink;
    const res = await apiFetch<{ success: boolean; data: ApiLoyaltyCard }>("/loyalty/join", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return res.data;
  },

  async myCards(): Promise<ApiLoyaltyCard[]> {
    const res = await apiFetch<{ success: boolean; count: number; data: ApiLoyaltyCard[] }>("/user/cards");
    return res.data;
  },

  async allCards(): Promise<ApiLoyaltyCard[]> {
    const res = await apiFetch<{ success: boolean; data: ApiLoyaltyCard[] }>("/admin/loyalty");
    return res.data;
  },

  async issuePoints(loyaltyId: string, points: number, visits: number): Promise<ApiLoyaltyCard> {
    const res = await apiFetch<{ success: boolean; data: ApiLoyaltyCard }>(
      `/admin/loyalty/${loyaltyId}/points`,
      { method: "PATCH", body: JSON.stringify({ points, visits }) }
    );
    return res.data;
  },
};

export const user = {
  async me(): Promise<AuthUser> {
    const res = await apiFetch<{ success: boolean; data: AuthUser }>("/user/me");
    return res.data;
  },
};