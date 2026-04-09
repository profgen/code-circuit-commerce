import Link from "next/link";
import Image from "next/image";
import { fetchProducts } from "@/lib/api";

export default async function Home() {
  const products = await fetchProducts();
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-3xl font-bold">Code & Circuit Commerce</h1>
      <p className="mt-2 text-slate-600">AI-first marketplace foundation</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="rounded-lg border p-4 hover:shadow-md"
          >
            <Image
              src={product.imageUrl}
              alt={product.title}
              width={600}
              height={400}
              className="h-44 w-full rounded-md object-cover"
            />
            <h2 className="mt-3 font-semibold">{product.title}</h2>
            <p className="text-sm text-slate-500">{product.currency} {product.price / 100}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
