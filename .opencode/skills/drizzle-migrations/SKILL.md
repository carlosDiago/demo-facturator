---
name: drizzle-migrations
description: Guia para cambios de schema, migraciones y seeds con Drizzle en este monorepo
---

Usa esta skill cuando tengas que anadir o modificar tablas, enums, indices, relaciones o seeds en la capa de base de datos.

Contexto del repo:
- El schema vive en `packages/database/src/schema/index.ts`.
- La configuracion de Drizzle vive en `packages/database/drizzle.config.ts`.
- Las seeds viven en `packages/database/src/seeds/index.ts`.
- La documentacion de modelo de datos esta en `docs/database/schema.md` y `docs/database/overview.md`.

Reglas de trabajo:
1. Antes de tocar el schema, revisa si la entidad o restriccion ya esta documentada o modelada.
2. Mantiene nombres consistentes con el dominio existente: organizaciones, perfiles fiscales, clientes, series, facturas y pagos.
3. Usa tipos y restricciones explicitas: `notNull`, `default`, `references`, `uniqueIndex` y enums cuando apliquen.
4. Si el cambio afecta contratos de entrada o salida, sincroniza tambien `packages/shared`.
5. Si el cambio afecta flujos de negocio, revisa `apps/api` para que el backend quede alineado.

Checklist para cambios de schema:
1. Actualiza `packages/database/src/schema/index.ts`.
2. Genera o ajusta la migracion correspondiente.
3. Revisa si hay que actualizar seeds en `packages/database/src/seeds/index.ts`.
4. Revisa si la documentacion del modelo necesita reflejar el cambio.
5. Verifica que claves unicas, claves foraneas y defaults sigan las reglas del dominio.

Buenas practicas para este proyecto:
- Las relaciones deben quedar claras y con `onDelete` intencional.
- Los importes y porcentajes deben usar precision decimal consistente.
- Las restricciones por organizacion son importantes y no deben perderse accidentalmente.
- Evita migraciones ambiguas o cambios de nombre sin revisar impacto en API y seeds.

Si propones un cambio grande:
1. Explica que tablas o enums cambian.
2. Indica si requiere backfill o ajuste de seeds.
3. Indica que contratos o servicios del backend deben actualizarse despues.
