'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { categories, formatMoney, getProduct } from '@/lib/products';
import { CartProvider, useCart } from '@/lib/cart';

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Prime Academics home">
      <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-xl shadow-blue-950/20 ring-1 ring-white/40">
        <span className="absolute inset-0 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_45%,#ffefe3_100%)]" />
        <svg viewBox="0 0 64 64" className="relative h-11 w-11" aria-hidden="true">
          <path d="M13 16c7-5 16-5 25 0v31c-9-5-18-5-25 0V16Z" fill="#0b4bdc" />
          <path d="M38 16c5-3 10-4 15-3v31c-5-1-10 0-15 3V16Z" fill="#ff6b00" />
          <path d="M18 24h13M18 31h13M43 23h7M43 30h7" stroke="white" strokeWidth="3" strokeLinecap="round" opacity=".95" />
          <path d="M18 45 31 19h6l13 26h-7l-2-5H27l-2 5h-7Zm12-11h8l-4-9-4 9Z" fill="white" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-2xl font-black tracking-tight text-white md:text-[28px]">Prime Academics</span>
        <span className="mt-1 block text-[11px] font-black uppercase tracking-[0.28em] text-blue-100">School Deals Store</span>
      </span>
    </Link>
  );
}

function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, subtotal, updateQuantity, removeItem, lastAdded, dismissAddedNotice } = useCart();
  const pathname = usePathname();
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    closeDrawer();
    // Only close the drawer after route changes; cart actions should not auto-close it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  useEffect(() => {
    if (!lastAdded) return;
    const timer = window.setTimeout(dismissAddedNotice, 2600);
    return () => window.clearTimeout(timer);
  }, [lastAdded, dismissAddedNotice]);
  return (
    <div className={`fixed inset-0 z-50 ${isDrawerOpen ? '' : 'pointer-events-none'}`}>
      <button className={`absolute inset-0 z-0 bg-black/40 transition-opacity ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`} onClick={closeDrawer} aria-label="Close cart" />
      <aside className={`absolute right-0 top-0 z-10 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
          <div>
            <p className="text-xs font-bold uppercase text-orange-500">Cart drawer</p>
            <h2 className="text-xl font-black text-slate-900">Your school supplies</h2>
          </div>
          <button onClick={closeDrawer} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">Close</button>
        </div>
        <div className="space-y-4 p-5">
          {items.length === 0 ? <p className="rounded-xl bg-blue-50 p-4 text-sm text-slate-700">Your cart is empty. Add flash deals or school kits to get started.</p> : null}
          {items.map((item) => {
            const product = getProduct(item.productId);
            if (!product) return null;
            return (
              <div key={item.productId + item.variant} className="flex gap-3 rounded-xl border p-3">
                <img src={product.image} alt="" className="h-20 w-20 rounded-lg object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-bold text-slate-900">{product.name}</p>
                  {item.variant ? <p className="text-xs text-slate-500">{item.variant}</p> : null}
                  <p className="font-black text-orange-600">{formatMoney(product.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)} className="h-7 w-7 rounded border">-</button>
                    <span className="text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)} className="h-7 w-7 rounded border">+</button>
                    <button onClick={() => removeItem(item.productId, item.variant)} className="ml-auto text-xs font-bold text-red-500">Remove</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="sticky bottom-0 border-t bg-white p-5">
          <div className="mb-4 flex items-center justify-between text-lg font-black"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link onClick={closeDrawer} href="/cart" className="rounded-xl border border-blue-600 py-3 text-center font-black text-blue-700 hover:bg-blue-50">View Cart</Link>
            <Link onClick={closeDrawer} href="/checkout" className={`rounded-xl py-3 text-center font-black text-white shadow-lg shadow-orange-200 ${items.length ? 'bg-orange-500 hover:bg-orange-600' : 'pointer-events-none bg-slate-300 shadow-none'}`}>Checkout</Link>
          </div>
        </div>
      </aside>
      {lastAdded ? (
        <div className="pointer-events-auto fixed bottom-5 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-green-200 bg-white p-4 shadow-2xl shadow-slate-900/20 sm:left-auto sm:right-5 sm:translate-x-0">
          <div className="flex gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-green-100 text-lg font-black text-green-700">✓</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-900">Added to cart</p>
              <p className="line-clamp-2 text-sm text-slate-600">{lastAdded.quantity}× {lastAdded.name}</p>
            </div>
            <button onClick={dismissAddedNotice} className="text-sm font-black text-slate-400 hover:text-slate-700" aria-label="Dismiss added to cart notice">×</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PromoTicker() {
  const items = [
    'Back-to-school sale now live',
    'Bulk orders accepted',
    'Classroom packs available',
    'School kits from ₱199',
    'Under ₱99 essentials',
    'Secure online payment via Maya',
    'Contact us for school quotations',
  ];
  const tickerItems = [...items, ...items];
  return (
    <div className="overflow-hidden bg-orange-500 text-white">
      <div className="ticker-track flex w-max items-center py-2 text-xs font-black uppercase tracking-wide sm:text-sm">
        {tickerItems.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center whitespace-nowrap px-8">
            <span className="mr-8 h-1.5 w-1.5 rounded-full bg-white/80" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M4 5h2l1.6 9.2a2 2 0 0 0 2 1.7h6.8a2 2 0 0 0 1.9-1.4L20 8H8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="20" r="1.5" fill="currentColor" />
      <circle cx="17" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

function HeaderInner() {
  const { count, openDrawer } = useCart();
  return (
    <>
      <PromoTicker />
      <header className="sticky top-0 z-40 bg-blue-700 shadow-xl shadow-blue-900/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center">
          <Logo />
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-white p-2 shadow-inner">
            <input className="min-w-0 flex-1 px-3 py-2 text-sm outline-none" placeholder="Search notebooks, pens, calculators, school kits..." />
            <Link href="/catalog" className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-black text-white">Search</Link>
          </div>
          <button onClick={openDrawer} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-black text-blue-700 shadow transition hover:bg-orange-50 hover:text-orange-600">
            <CartIcon /> Cart ({count})
          </button>
        </div>
        <nav className="border-t border-blue-400/30 bg-gradient-to-r from-blue-800 via-blue-700 to-blue-800">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="nav-scroll flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/10 p-1.5 text-sm font-black text-white shadow-inner shadow-blue-950/10 backdrop-blur">
              <Link href="/catalog" className="whitespace-nowrap rounded-xl px-4 py-2.5 transition hover:bg-white hover:text-blue-700">All Products</Link>
              {categories.map((category) => <Link href={`/catalog?category=${encodeURIComponent(category)}`} key={category} className="whitespace-nowrap rounded-xl px-4 py-2.5 transition hover:bg-white hover:text-blue-700">{category}</Link>)}
            </div>
          </div>
        </nav>
      </header>
      <CartDrawer />
    </>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <HeaderInner />
      {children}
      <footer className="mt-16 border-t bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
          <div><Logo /><p className="mt-4 text-sm text-slate-300">Budget-friendly school supplies for students, teachers, and schools.</p></div>
          <div><h3 className="font-black">Shop</h3><div className="mt-3 grid gap-2 text-sm text-slate-300"><Link href="/catalog">Catalog</Link><Link href="/bulk-orders">Bulk Orders</Link><Link href="/catalog?category=School%20Kits">School Kits</Link></div></div>
          <div><h3 className="font-black">Help</h3><div className="mt-3 grid gap-2 text-sm text-slate-300"><Link href="/contact">Contact</Link><Link href="/faq">FAQ</Link><Link href="/about">About</Link></div></div>
          <div><h3 className="font-black">Preview note</h3><p className="mt-3 text-xs leading-5 text-slate-400">Product catalog, prices, and availability are sample entries for preview and will be finalized before launch.</p></div>
        </div>
      </footer>
    </CartProvider>
  );
}
