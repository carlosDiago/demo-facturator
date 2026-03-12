export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f9d9b7_0%,#f7f1ea_42%,#efe8dd_100%)] px-6 py-16 text-stone-900 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 rounded-[2rem] border border-stone-900/10 bg-white/75 p-8 shadow-[0_30px_80px_rgba(78,55,33,0.12)] backdrop-blur sm:p-12">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-amber-900/15 bg-amber-100 px-4 py-1 text-sm font-medium tracking-[0.18em] text-amber-950 uppercase">
            Monorepo en construccion
          </span>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Demo Facturator ya esta reorganizado para crecer con backend y base de datos propia.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-stone-700">
              Esta primera base deja lista la separacion entre `web`, `api`, paquetes compartidos e infraestructura para empezar el MVP de facturacion para Espana.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <section className="rounded-3xl border border-stone-900/10 bg-stone-50 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
              Frontend
            </p>
            <h2 className="mt-3 text-2xl font-semibold">`apps/web`</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Next.js queda aislado como capa de interfaz y consumo de API.
            </p>
          </section>
          <section className="rounded-3xl border border-stone-900/10 bg-stone-50 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
              Backend
            </p>
            <h2 className="mt-3 text-2xl font-semibold">`apps/api`</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              NestJS queda preparado para auth propia, dominio fiscal y reglas de negocio.
            </p>
          </section>
          <section className="rounded-3xl border border-stone-900/10 bg-stone-50 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
              Compartido
            </p>
            <h2 className="mt-3 text-2xl font-semibold">`packages/*`</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Tipos, configuracion y futura capa de datos ya tienen sitio propio.
            </p>
          </section>
          <section className="rounded-3xl border border-stone-900/10 bg-stone-50 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
              Infra
            </p>
            <h2 className="mt-3 text-2xl font-semibold">`infra/compose`</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Hay una base local para PostgreSQL y el resto de servicios vendran despues.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
