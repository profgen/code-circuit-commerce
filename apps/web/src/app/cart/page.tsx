"use client";

import { FormEvent, useState } from "react";
import { API_URL } from "@/lib/api";

export default function CartPage() {
  const [token, setToken] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartJson, setCartJson] = useState("");

  async function fetchCart() {
    const res = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCartJson(JSON.stringify(await res.json(), null, 2));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await fetch(`${API_URL}/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });
    await fetchCart();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-bold">Cart</h1>
      <p className="mt-2 text-sm text-slate-600">
        Temporary dev UI: use your JWT token and productId.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          className="w-full rounded border p-2"
          placeholder="JWT access token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <input
          className="w-full rounded border p-2"
          placeholder="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
        <input
          className="w-full rounded border p-2"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <div className="flex gap-3">
          <button className="rounded bg-black px-4 py-2 text-white" type="submit">
            Add / Update Item
          </button>
          <button
            className="rounded border px-4 py-2"
            type="button"
            onClick={fetchCart}
          >
            Refresh Cart
          </button>
        </div>
      </form>
      <pre className="mt-6 overflow-x-auto rounded bg-slate-100 p-4 text-xs">
        {cartJson || "Cart response appears here"}
      </pre>
    </main>
  );
}
