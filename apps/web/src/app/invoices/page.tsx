const draftEndpoints = [
  "GET /api/invoices",
  "GET /api/invoices/:id",
  "POST /api/invoices",
  "PUT /api/invoices/:id",
  "DELETE /api/invoices/:id",
  "POST /api/invoices/:id/duplicate",
  "POST /api/invoices/:id/issue",
  "POST /api/invoices/:id/cancel",
];

export default function InvoicesPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d9eadf_0%,#edf4ef_45%,#f8faf8_100%)] px-6 py-16 text-stone-900 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl space-y-8 rounded-[2rem] border border-stone-900/10 bg-white/80 p-8 shadow-[0_30px_80px_rgba(41,71,55,0.10)] backdrop-blur sm:p-12">
        <div className="space-y-4">
          <span className="inline-flex rounded-full border border-emerald-900/15 bg-emerald-100 px-4 py-1 text-sm uppercase tracking-[0.2em] text-emerald-950">
            Facturas
          </span>
          <h1 className="text-4xl font-semibold tracking-tight">Borradores, emision y cancelacion</h1>
          <p className="max-w-3xl text-lg leading-8 text-stone-700">
            Este bloque deja el dominio preparado para crear borradores, emitir con numeracion correlativa, congelar snapshots fiscales y cancelar con motivo cuando no existan pagos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {draftEndpoints.map((endpoint) => (
            <div key={endpoint} className="rounded-3xl border border-stone-900/10 bg-stone-50 p-5">
              <code className="text-sm text-emerald-900">{endpoint}</code>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
