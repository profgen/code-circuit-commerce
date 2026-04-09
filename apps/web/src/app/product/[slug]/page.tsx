import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchProduct } from "@/lib/api";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <Link href="/" className="text-sm text-blue-600">
        Back to home
      </Link>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <Image
          src={product.imageUrl}
          alt={product.title}
          width={1200}
          height={800}
          className="h-80 w-full rounded-lg object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <p className="mt-2 text-slate-700">{product.description}</p>
          <p className="mt-4 text-lg font-semibold">
            {product.currency} {product.price / 100}
          </p>
          <p className="mt-1 text-sm text-slate-500">Stock: {product.stock}</p>
          <Link
            href="/cart"
            className="mt-6 inline-flex rounded-md bg-black px-4 py-2 text-white"
          >
            Go to cart
          </Link>
        </div>
      </div>
    </main>
  );
}
