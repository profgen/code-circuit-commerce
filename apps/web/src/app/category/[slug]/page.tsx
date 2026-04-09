import Link from "next/link";
import { fetchProducts } from "@/lib/api";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await fetchProducts();

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold">Category: {slug}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="rounded-lg border p-4"
          >
            <h2 className="font-semibold">{product.title}</h2>
            <p className="text-sm text-slate-500">
              {product.currency} {product.price / 100}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
