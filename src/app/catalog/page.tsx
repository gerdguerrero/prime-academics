'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductCard, SectionHeader } from '@/components/product-card';
import { categories, products } from '@/lib/products';

function CatalogContent() {
  const params = useSearchParams();
  const router = useRouter();
  const category = params.get('category') ?? 'All';
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Popular');

  const setCategory = (nextCategory: string) => {
    router.replace(nextCategory === 'All' ? '/catalog' : `/catalog?category=${encodeURIComponent(nextCategory)}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    let list = products.filter((product) => category === 'All' || product.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((product) => [product.name, product.brand, product.category, product.description, ...product.specs].join(' ').toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (sort === 'Latest') return products.indexOf(b) - products.indexOf(a);
      if (sort === 'Price: Low to High') return a.price - b.price;
      if (sort === 'Price: High to Low') return b.price - a.price;
      if (sort === 'Biggest Discount') return ((b.compareAt ?? b.price) - b.price) - ((a.compareAt ?? a.price) - a.price);
      return b.sold - a.sold;
    });
  }, [category, query, sort]);

  return (
    <>
      <div className="mb-5 grid gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:grid-cols-[1fr_220px_220px]">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search brand, product, specs..." className="rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500" />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border px-4 py-3 text-sm font-bold outline-none focus:border-blue-500">
          <option>All</option>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-xl border px-4 py-3 text-sm font-bold outline-none focus:border-blue-500">
          {['Popular','Latest','Price: Low to High','Price: High to Low','Biggest Discount'].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="mb-4 flex items-center justify-between text-sm font-bold text-slate-600"><span>{filtered.length} products found</span><span>PHP pricing · Demo catalog</span></div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </>
  );
}

export default function CatalogPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <SectionHeader eyebrow="Shop the catalog" title="School supplies, deals, and classroom packs" />
      <Suspense fallback={<div className="rounded-2xl border bg-white p-8 font-bold">Loading catalog...</div>}>
        <CatalogContent />
      </Suspense>
    </main>
  );
}
