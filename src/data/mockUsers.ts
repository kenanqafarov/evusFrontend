export type UserType = "admin" | "user";

export interface MockUser {
  username: string;
  password: string;
  type: UserType;
  fullName: string;
}

export const mockUsers: MockUser[] = [
  { username: "admin", password: "admin123", type: "admin", fullName: "Admin İstifadəçi" },
  { username: "user", password: "user123", type: "user", fullName: "Normal İstifadəçi" },
];
