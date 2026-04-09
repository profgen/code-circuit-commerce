const SERVER_API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";
const CLIENT_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
export const API_URL =
  typeof window === "undefined" ? SERVER_API_URL : CLIENT_API_URL;

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  imageUrl: string;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/products/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}
