# Demo Facturator

Monorepo para construir una plataforma de facturacion para Espana con backend propio, base de datos propia y trazabilidad estricta.

## Estructura

- `apps/web`: frontend en Next.js.
- `apps/api`: backend en NestJS.
- `packages/shared`: contratos, esquemas y utilidades compartidas.
- `packages/database`: futura capa de PostgreSQL y migraciones.
- `packages/config`: configuracion compartida de TypeScript y lint.
- `docs`: arquitectura, base de datos y roadmap.

## Stack objetivo

- `pnpm` workspaces
- `turbo`
- `Next.js`
- `NestJS`
- `PostgreSQL`

## Primeros pasos

```bash
corepack pnpm install
corepack pnpm dev
```

En esta fase la estructura base del monorepo ya esta preparada para desarrollar los siguientes bloques: base de datos, auth propia, organizaciones, clientes, series y facturacion.

## Base de datos local

```bash
docker compose -f infra/compose/docker-compose.yml up -d postgres
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm db:seed
```

La cadena de conexion por defecto esta documentada en `.env.example`.

## Credenciales demo

Tras ejecutar el seed inicial, queda disponible este usuario:

- email: `demo@facturator.local`
- password: `changeme123`

## API actual

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/organizations/current`
- `POST /api/organizations`
- `GET /api/company-profile`
- `PUT /api/company-profile`

## Documentacion

- `docs/architecture/overview.md`
- `docs/database/overview.md`
- `docs/product/roadmap.md`

## Skills para agentes

Este repo incluye skills reutilizables para herramientas compatibles como OpenCode y Claude Code.

- Compatibilidad OpenCode: `.opencode/skills/`
- Compatibilidad Claude: `.claude/skills/`

Skills disponibles actualmente:

- `repo-architecture`
- `facturacion-backend`
- `forms-and-validation`
- `ask-questions-if-underspecified`
- `drizzle-migrations`
- `documentation-guidelines`

Para que se descubran correctamente, abre la herramienta desde la raiz del repositorio.

## Nota sobre Supabase

`supabase_schema.sql` se mantiene solo como referencia historica del enfoque inicial. La nueva direccion del proyecto es backend propio + PostgreSQL propio.
