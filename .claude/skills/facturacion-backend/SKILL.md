---
name: facturacion-backend
description: Convenciones para implementar logica backend de facturacion y dominio fiscal en este proyecto
---

Usa esta skill cuando trabajes en entidades, servicios o endpoints relacionados con organizaciones, perfil fiscal, clientes, series, facturas o pagos.

Puntos del dominio a respetar:
- La plataforma esta orientada a facturacion para Espana.
- La moneda inicial es `EUR`.
- Existen estados de factura como `draft`, `issued`, `partially_paid`, `paid` y `cancelled`.
- Las series de factura son por organizacion y tienen correlativo.
- La factura guarda snapshots fiscales y no debe modelarse como un recurso ambiguo.

Al implementar backend:
1. Revisa primero `packages/database/src/schema/index.ts` para entender tablas, enums y restricciones.
2. Reutiliza contratos y tipos de `packages/shared` antes de crear nuevos.
3. Valida entradas con Zod cuando el contrato ya este definido.
4. Manten la logica HTTP en controladores y la logica de negocio en servicios.
5. Conserva mensajes y nombres de dominio en espanol cuando el codigo actual ya siga ese patron.

Detalles importantes del repo:
- `company_profiles` soporta `self_employed` y `company`.
- Hay restricciones unicas por organizacion para series y numeracion.
- Los importes monetarios y porcentajes se persisten con precision decimal.
- La auth y el contexto de organizacion ya estan resueltos en `apps/api/src/modules/auth`.

Si propones cambios en facturacion:
1. Explica que entidades se ven afectadas.
2. Indica si cambia schema, contrato compartido y endpoint.
3. Mantiene coherencia con trazabilidad y restricciones existentes.
