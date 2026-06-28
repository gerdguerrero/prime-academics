'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { useCart } from '@/lib/cart';
import { formatCardPrice, formatMoney, getProduct, products } from '@/lib/products';
import { useMemo, useState } from 'react';

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const product = getProduct(params.id);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState('');
  const [justAdded, setJustAdded] = useState(false);
  const related = useMemo(() => products.filter((item) => item.category === product?.category && item.id !== product.id).slice(0, 6), [product]);
  if (!product) notFound();
  const savings = product.compareAt ? product.compareAt - product.price : 0;
  const addSelectedToCart = () => {
    addItem(product, quantity, variant || undefined);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 text-sm font-bold text-slate-500"><Link href="/catalog" className="text-blue-700">Catalog</Link> / {product.category}</div>
      <section className="grid gap-6 rounded-2xl border bg-white p-4 shadow-sm lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl bg-white p-4">
          <div className="grid aspect-square place-items-center rounded-2xl border bg-white p-5"><img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" /></div>
        </div>
        <div className="p-2 lg:p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{product.brand}</span>
            {product.badge ? <span className="rounded bg-orange-500 px-3 py-1 text-xs font-black text-white">{product.badge}</span> : null}
            <span className="rounded bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{product.availability}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-4xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500"><span>⭐ {product.rating} rating</span><span>{product.sold.toLocaleString('en-PH')} sold</span><span>{product.category}</span></div>
          <div className="mt-5 rounded-2xl bg-orange-50 p-5">
            <div className="flex items-end gap-3"><span className="text-4xl font-black text-orange-600">{formatCardPrice(product.price)}</span>{product.compareAt ? <span className="text-lg text-slate-400 line-through">{formatCardPrice(product.compareAt)}</span> : null}</div>
            {savings ? <p className="mt-1 text-sm font-black text-orange-700">Save {formatMoney(savings)} today</p> : null}
          </div>

          {product.variants?.map((group) => (
            <div key={group.name} className="mt-5">
              <p className="mb-2 text-sm font-black text-slate-700">{group.name}</p>
              <div className="flex flex-wrap gap-2">{group.values.map((value) => <button key={value} onClick={() => setVariant(`${group.name}: ${value}`)} className={`rounded-lg border px-4 py-2 text-sm font-bold ${variant.includes(value) ? 'border-orange-500 bg-orange-50 text-orange-600' : 'text-slate-700'}`}>{value}</button>)}</div>
            </div>
          ))}

          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm font-black">Quantity</span>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-9 w-9 rounded-lg border font-black">-</button>
            <span className="w-8 text-center font-black">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="h-9 w-9 rounded-lg border font-black">+</button>
          </div>

          {product.bulk ? <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4"><p className="font-black text-blue-800">Request Bulk Quote</p><p className="mt-1 text-sm text-slate-700">Bulk orders: minimum {product.moq ?? 5} pcs/sets. Final availability and school pricing will be confirmed by Prime Academics.</p></div> : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button onClick={addSelectedToCart} className={`rounded-xl px-6 py-4 font-black text-white shadow-lg transition ${justAdded ? 'bg-green-600 shadow-green-200' : 'bg-orange-500 shadow-orange-200 hover:bg-orange-600'}`}>{justAdded ? 'Added to Cart ✓' : 'Add to Cart'}</button>
            {product.bulk ? <Link href="/bulk-orders" className="rounded-xl border border-blue-600 px-6 py-4 text-center font-black text-blue-700 hover:bg-blue-50">Request Bulk Quote</Link> : <Link href="/cart" className="rounded-xl border px-6 py-4 text-center font-black text-slate-700 hover:bg-slate-50">Go to Cart</Link>}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Product details</h2><p className="mt-3 text-slate-700">{product.description}</p><ul className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">{product.specs.map((spec) => <li key={spec} className="rounded-lg bg-slate-50 p-3">✓ {spec}</li>)}</ul>{product.kitItems ? <div className="mt-4 rounded-xl bg-blue-50 p-4"><strong>Kit includes:</strong> {product.kitItems.join(', ')}</div> : null}</div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Customer reviews</h2><p className="mt-1 text-sm font-bold text-orange-600">⭐ {product.rating} average rating</p><div className="mt-4 grid gap-3">{product.reviews.slice(0,3).map((review, index) => <div key={review} className="rounded-xl bg-slate-50 p-3"><p className="text-sm text-slate-700">“{review}”</p><p className="mt-2 text-xs font-black text-slate-500">Buyer {index + 1}</p></div>)}</div></div>
      </section>

      <section className="mt-10"><h2 className="mb-4 text-2xl font-black">Related products</h2><div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>
    </main>
  );
}
