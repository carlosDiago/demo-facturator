const apiEndpoints = [
  "GET /api/clients",
  "GET /api/clients/:id",
  "POST /api/clients",
  "PUT /api/clients/:id",
  "DELETE /api/clients/:id",
];

export default function ClientsPage() {
  return (
    <main className="min-h-screen bg-stone-950 px-6 py-16 text-stone-50 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur sm:p-12">
        <div className="space-y-4">
          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1 text-sm uppercase tracking-[0.2em] text-emerald-200">
            Clientes
          </span>
          <h1 className="text-4xl font-semibold tracking-tight">Agenda por organizacion</h1>
          <p className="max-w-3xl text-lg leading-8 text-stone-300">
            Esta vista deja visible el alcance del bloque actual: CRUD de clientes con aislamiento por organizacion y desactivacion logica.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {apiEndpoints.map((endpoint) => (
            <div key={endpoint} className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <code className="text-sm text-emerald-200">{endpoint}</code>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
