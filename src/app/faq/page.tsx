const faqs = [
  ['Do you accept bulk orders?', 'Yes. The preview includes a bulk quote request flow for classroom packs, school kits, and school office supplies.'],
  ['Can I order without an account?', 'Yes. This v1 storefront uses guest checkout.'],
  ['How is payment confirmed?', 'Payment method will be coordinated after the order is placed. The final payment gateway is deferred for the next phase.'],
  ['Are prices final?', 'Preview prices are sample entries for review and will be finalized before launch.'],
  ['Do you deliver?', 'Yes. Prime Academics uses delivery only. Delivery fee, schedule, and availability will be confirmed by call after order placement.'],
];

export default function FAQPage() {
  return <main className="mx-auto max-w-4xl px-4 py-12"><h1 className="text-4xl font-black">FAQ</h1><div className="mt-6 grid gap-4">{faqs.map(([q,a]) => <div key={q} className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="font-black text-slate-950">{q}</h2><p className="mt-2 text-slate-600">{a}</p></div>)}</div></main>;
}
