export type UserRole = "customer" | "admin";

export interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
}

export interface CartItemView {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
}
