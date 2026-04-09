"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

export default function CheckoutPage() {
  const [token, setToken] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(crypto.randomUUID());
  const [result, setResult] = useState("");

  async function startCheckout() {
    const res = await fetch(`${API_URL}/checkout/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ idempotencyKey }),
    });
    setResult(JSON.stringify(await res.json(), null, 2));
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <div className="mt-6 space-y-3">
        <input
          className="w-full rounded border p-2"
          placeholder="JWT access token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <input
          className="w-full rounded border p-2"
          placeholder="Idempotency key"
          value={idempotencyKey}
          onChange={(e) => setIdempotencyKey(e.target.value)}
        />
        <button
          onClick={startCheckout}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Initialize Checkout
        </button>
      </div>
      <pre className="mt-6 overflow-x-auto rounded bg-slate-100 p-4 text-xs">
        {result || "Checkout response appears here"}
      </pre>
    </main>
  );
}
