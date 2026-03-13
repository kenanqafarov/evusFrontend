export type UserType = "admin" | "user";

export interface MockUser {
  username: string;
  password: string;
  type: UserType;
}

export const mockUsers: MockUser[] = [
  { username: "admin", password: "admin123", type: "admin" },
  { username: "user", password: "user123", type: "user" },
];
