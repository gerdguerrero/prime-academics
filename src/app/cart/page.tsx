'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { formatMoney, getProduct } from '@/lib/products';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-black">Cart</h1>
      <p className="mt-1 text-slate-600">Review your school supplies before placing the order.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px]">
        <section className="space-y-3">
          {items.length === 0 ? <div className="rounded-2xl border bg-white p-8 text-center"><p className="font-bold text-slate-600">Your cart is empty.</p><Link href="/catalog" className="mt-4 inline-block rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Shop products</Link></div> : null}
          {items.map((item) => {
            const product = getProduct(item.productId);
            if (!product) return null;
            return <div key={item.productId + item.variant} className="flex gap-4 rounded-2xl border bg-white p-4 shadow-sm"><img src={product.image} alt="" className="h-24 w-24 rounded-xl object-contain" /><div className="flex-1"><h2 className="font-black text-slate-900">{product.name}</h2>{item.variant ? <p className="text-sm text-slate-500">{item.variant}</p> : null}<p className="mt-1 font-black text-orange-600">{formatMoney(product.price)}</p><div className="mt-3 flex items-center gap-2"><button className="h-8 w-8 rounded border" onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}>-</button><span className="font-black">{item.quantity}</span><button className="h-8 w-8 rounded border" onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}>+</button><button onClick={() => removeItem(item.productId, item.variant)} className="ml-auto text-sm font-black text-red-500">Remove</button></div></div></div>;
          })}
        </section>
        <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Order summary</h2>
          <div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div><div className="flex justify-between text-slate-500"><span>Payment</span><span>To be confirmed</span></div><div className="flex justify-between text-slate-500"><span>Delivery</span><span>To be confirmed</span></div></div>
          <div className="mt-4 rounded-xl bg-blue-50 p-3 text-xs text-slate-700">Prime Academics will contact you to confirm payment, delivery, and availability after order placement.</div>
          <Link href="/checkout" className={`mt-5 block rounded-xl py-3 text-center font-black text-white ${items.length ? 'bg-orange-500' : 'pointer-events-none bg-slate-300'}`}>Proceed to Checkout</Link>
        </aside>
      </div>
    </main>
  );
}
