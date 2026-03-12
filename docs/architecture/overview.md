# Arquitectura

Este repositorio se ha reorganizado como monorepo para separar la web de la API y preparar una base de datos propia.

- `apps/web`: frontend en Next.js.
- `apps/api`: backend en NestJS.
- `packages/shared`: contratos, tipos y validaciones compartidas.
- `packages/database`: futura capa de esquema y acceso a PostgreSQL.
- `packages/config`: configuracion compartida.
