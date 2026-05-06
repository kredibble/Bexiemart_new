export type Role = "customer" | "vendor";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
}
