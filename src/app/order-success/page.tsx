import Link from 'next/link';

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string; payment?: string }> }) {
  const params = await searchParams;
  const order = params.order ?? `PA-${new Date().getFullYear()}-1048`;
  const payment = params.payment;
  const isGatewayPending = payment === 'pending';
  const isSetupRequired = payment === 'setup-required';

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-100 text-4xl">✓</div>
        <h1 className="mt-5 text-4xl font-black text-slate-950">{isGatewayPending ? 'Payment handoff complete' : 'Order received'}</h1>
        <p className="mt-3 text-lg text-slate-600">Your order reference is <strong>{order}</strong>.</p>
        {isGatewayPending ? (
          <p className="mx-auto mt-4 max-w-xl text-slate-600">If your gateway payment is completed, Prime Academics will confirm the payment notification and prepare delivery.</p>
        ) : isSetupRequired ? (
          <p className="mx-auto mt-4 max-w-xl text-slate-600">Your order request was captured. Gateway credentials are not connected yet, so Prime Academics will contact you to finish payment and delivery confirmation.</p>
        ) : (
          <p className="mx-auto mt-4 max-w-xl text-slate-600">Prime Academics will contact you to confirm payment, delivery, and availability. Thank you for shopping budget-friendly school essentials.</p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/catalog" className="rounded-xl bg-orange-500 px-6 py-3 font-black text-white">Continue shopping</Link>
          <Link href="/" className="rounded-xl border px-6 py-3 font-black text-slate-700">Back home</Link>
        </div>
      </div>
    </main>
  );
}
