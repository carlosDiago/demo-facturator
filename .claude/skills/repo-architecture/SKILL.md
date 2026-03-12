---
name: repo-architecture
description: Guia para ubicar cambios correctamente en el monorepo de facturacion
---

Usa esta skill cuando tengas que decidir donde implementar un cambio o cuando vayas a tocar varias capas del sistema.

Contexto del proyecto:
- `apps/web`: frontend en Next.js.
- `apps/api`: backend en NestJS.
- `packages/shared`: contratos, schemas Zod, tipos y utilidades compartidas.
- `packages/database`: esquema Drizzle, cliente y migraciones para PostgreSQL.
- `docs`: arquitectura, modelo de datos y roadmap del producto.

Reglas de ubicacion:
1. Pon la UI, navegacion y estado de pantalla en `apps/web`.
2. Pon controladores, servicios, auth y logica de aplicacion en `apps/api`.
3. Pon schemas, tipos y contratos reutilizables en `packages/shared`.
4. Pon tablas, enums, relaciones y acceso a base de datos en `packages/database`.
5. Evita duplicar contratos o validaciones entre `web` y `api`.

Antes de proponer cambios:
1. Revisa si el contrato ya existe en `packages/shared`.
2. Revisa si la entidad o restriccion ya existe en `packages/database`.
3. Asegura que la API consuma y devuelva contratos compartidos.
4. Si cambias dominio o estructura, comprueba si hay documentacion relacionada en `docs`.

Prioridades de implementacion:
- Mantener separacion clara entre presentacion, aplicacion, contratos y persistencia.
- Reutilizar nombres y conceptos del dominio ya existentes.
- Favorecer cambios pequenos y consistentes con la estructura actual del monorepo.
