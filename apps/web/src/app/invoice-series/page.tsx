const features = [
  "codigo unico por organizacion",
  "serie por defecto",
  "activacion y desactivacion",
  "base para numeracion correlativa",
];

export default function InvoiceSeriesPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f1ea_0%,#efe4d6_100%)] px-6 py-16 text-stone-900 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl space-y-8 rounded-[2rem] border border-stone-900/10 bg-white/80 p-8 shadow-[0_30px_80px_rgba(78,55,33,0.12)] backdrop-blur sm:p-12">
        <div className="space-y-4">
          <span className="inline-flex rounded-full border border-amber-900/15 bg-amber-100 px-4 py-1 text-sm uppercase tracking-[0.2em] text-amber-950">
            Series
          </span>
          <h1 className="text-4xl font-semibold tracking-tight">Numeracion preparada</h1>
          <p className="max-w-3xl text-lg leading-8 text-stone-700">
            La API ya soporta CRUD de series y cambio de serie por defecto, dejando lista la base para la emision estricta del siguiente bloque.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <div key={feature} className="rounded-3xl border border-stone-900/10 bg-stone-50 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Capacidad</p>
              <p className="mt-3 text-xl font-semibold text-stone-900">{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
