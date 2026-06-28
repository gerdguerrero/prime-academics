import Link from 'next/link';

export default async function PaymentFailedPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const params = await searchParams;
  const order = params.order;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-red-100 text-4xl text-red-600">!</div>
        <h1 className="mt-5 text-4xl font-black text-slate-950">Payment was not completed</h1>
        {order ? <p className="mt-3 text-lg text-slate-600">Order reference: <strong>{order}</strong></p> : null}
        <p className="mx-auto mt-4 max-w-xl text-slate-600">The payment gateway reported a failed, cancelled, or expired payment. You can retry checkout or contact Prime Academics for assistance.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/checkout" className="rounded-xl bg-orange-500 px-6 py-3 font-black text-white">Retry checkout</Link>
          <Link href="/contact" className="rounded-xl border px-6 py-3 font-black text-slate-700">Contact support</Link>
        </div>
      </div>
    </main>
  );
}
