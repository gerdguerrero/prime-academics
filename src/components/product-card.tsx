'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Product, formatCardPrice } from '@/lib/products';
import { useCart } from '@/lib/cart';

export function ProductCard({ product, compact = true }: { product: Product; compact?: boolean }) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const discount = product.compareAt ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100) : 0;
  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(false), 1200);
    return () => window.clearTimeout(timer);
  }, [justAdded]);

  const handleAdd = () => {
    addItem(product);
    setJustAdded(true);
  };

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/product/${product.id}`} className="relative block bg-white p-3">
        {discount ? <span className="absolute left-2 top-2 z-10 rounded bg-orange-500 px-2 py-1 text-[11px] font-black text-white">{discount}% OFF</span> : null}
        {product.bulk ? <span className="absolute right-2 top-2 z-10 rounded bg-blue-600 px-2 py-1 text-[10px] font-black text-white">BULK</span> : null}
        <div className="grid aspect-square place-items-center rounded-lg bg-white">
          <img src={product.image} alt={product.name} className="h-full w-full object-contain transition group-hover:scale-105" loading="lazy" />
        </div>
      </Link>
      <div className={`space-y-2 ${compact ? 'p-3 pt-0' : 'p-4 pt-0'}`}>
        <p className="text-[11px] font-black uppercase tracking-wide text-blue-600">{product.brand}</p>
        <Link href={`/product/${product.id}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-5 text-slate-900 hover:text-orange-600">{product.name}</Link>
        {product.kitItems ? <p className="line-clamp-1 text-xs text-slate-500">Includes: {product.kitItems.slice(0, 3).join(', ')}</p> : null}
        <div className="flex items-end gap-2">
          <span className="text-xl font-black text-orange-600">{formatCardPrice(product.price)}</span>
          {product.compareAt ? <span className="text-xs text-slate-400 line-through">{formatCardPrice(product.compareAt)}</span> : null}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500"><span>⭐ {product.rating}</span><span>{product.sold.toLocaleString('en-PH')} sold</span></div>
        <div className="grid grid-cols-[1fr_auto] gap-2 pt-1">
          <button onClick={handleAdd} className={`rounded-lg px-3 py-2 text-xs font-black text-white transition ${justAdded ? 'bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}`}>{justAdded ? 'Added ✓' : 'Add to Cart'}</button>
          <Link href={`/product/${product.id}`} className="rounded-lg border px-3 py-2 text-xs font-black text-slate-700 hover:border-blue-500 hover:text-blue-600">Details</Link>
        </div>
      </div>
    </article>
  );
}

export function SectionHeader({ eyebrow, title, href }: { eyebrow?: string; title: string; href?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">{eyebrow}</p> : null}
        <h2 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">{title}</h2>
      </div>
      {href ? <Link href={href} className="text-sm font-black text-blue-700 hover:text-orange-500">View all →</Link> : null}
    </div>
  );
}
