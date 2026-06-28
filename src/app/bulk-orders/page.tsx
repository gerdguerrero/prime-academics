import { SectionHeader } from '@/components/product-card';

export default function BulkOrdersPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <SectionHeader eyebrow="For teachers and schools" title="Request a Bulk Quote" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <form className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold">Name<input className="rounded-xl border px-4 py-3 font-normal" /></label>
            <label className="grid gap-1 text-sm font-bold">School / organization<input className="rounded-xl border px-4 py-3 font-normal" /></label>
            <label className="grid gap-1 text-sm font-bold">Mobile number<input className="rounded-xl border px-4 py-3 font-normal" /></label>
            <label className="grid gap-1 text-sm font-bold">Email<input className="rounded-xl border px-4 py-3 font-normal" /></label>
            <label className="grid gap-1 text-sm font-bold md:col-span-2">Needed items<textarea rows={4} className="rounded-xl border px-4 py-3 font-normal" placeholder="Example: 10 reams A4 bond paper, 50 notebooks, 3 boxes ballpens..." /></label>
            <label className="grid gap-1 text-sm font-bold">Estimated quantity<input className="rounded-xl border px-4 py-3 font-normal" /></label>
            <label className="grid gap-1 text-sm font-bold">Target date<input type="date" className="rounded-xl border px-4 py-3 font-normal" /></label>
            <label className="grid gap-1 text-sm font-bold md:col-span-2">Notes<textarea rows={3} className="rounded-xl border px-4 py-3 font-normal" /></label>
          </div>
          <button type="button" className="mt-5 rounded-xl bg-orange-500 px-6 py-3 font-black text-white">Submit Quote Request</button>
        </form>
        <aside className="rounded-2xl bg-blue-700 p-6 text-white shadow-sm">
          <h2 className="text-2xl font-black">Bulk-ready school essentials</h2>
          <p className="mt-3 text-blue-50">Use this page for classroom packs, school office supplies, grade-level kits, and recurring supply orders.</p>
          <ul className="mt-5 grid gap-3 text-sm font-bold"><li>✓ Classroom packs</li><li>✓ Teacher bundles</li><li>✓ School kits</li><li>✓ Paper, pens, notebooks, and art supplies</li></ul>
          <p className="mt-5 rounded-xl bg-white/10 p-4 text-sm">Final bulk pricing and availability will be confirmed by Prime Academics.</p>
        </aside>
      </div>
    </main>
  );
}
