# Base de datos

La estrategia activa del proyecto es `PostgreSQL + Drizzle`, sin dependencia de BaaS.

## Ubicacion

- `packages/database/src/schema/index.ts`: definicion del modelo.
- `packages/database/src/migrations`: SQL generado por Drizzle.
- `packages/database/src/seeds/index.ts`: seed inicial para desarrollo.
- `packages/database/drizzle.config.ts`: configuracion de migraciones.

## Entidades iniciales

- `users`
- `sessions`
- `organizations`
- `organization_members`
- `company_profiles`
- `clients`
- `invoice_series`
- `invoices`
- `invoice_items`
- `payments`
- `attachments`
- `audit_logs`

## Reglas clave del modelo

- una organizacion tiene un perfil fiscal propio
- una factura pertenece a una organizacion, cliente y serie
- el numero definitivo solo existe al emitir
- el estado soporta `draft`, `issued`, `partially_paid`, `paid` y `cancelled`
- la trazabilidad de cancelacion y pago queda preparada desde el esquema

## Desarrollo local

```bash
docker compose -f infra/compose/docker-compose.yml up -d postgres
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm db:seed
```

`supabase_schema.sql` se mantiene solo como referencia historica del enfoque inicial.
