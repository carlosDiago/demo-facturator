---
name: documentation-guidelines
description: Guia para escribir y mantener documentacion tecnica clara y consistente en este monorepo
---

Usa esta skill cuando tengas que crear o actualizar documentacion tecnica, funcional o de arquitectura en el proyecto.

Contexto del repo:
- La documentacion principal vive en `README.md` y en `docs/`.
- La arquitectura base esta descrita en `docs/architecture/overview.md`.
- El modelo de datos y decisiones de dominio estan en `docs/database/overview.md` y `docs/database/schema.md`.
- El producto y su direccion estan reflejados en `docs/product/roadmap.md`.

Objetivos de la documentacion:
- Explicar que existe hoy, no una arquitectura idealizada.
- Reflejar decisiones reales del codigo y del modelo de datos.
- Ayudar a alguien nuevo a entender rapidamente donde tocar y por que.
- Mantener consistencia con el lenguaje del dominio de facturacion para Espana.

Reglas de escritura:
1. Escribe de forma concreta, breve y estructurada.
2. Usa nombres de carpetas, modulos, tablas y conceptos exactamente como existen en el repo.
3. Evita duplicar informacion si ya existe en otro documento; enlaza o referencia la fuente correcta.
4. Si documentas flujos, separa claramente contexto, componentes afectados, contratos y restricciones.
5. Si documentas una decision, deja claro el impacto tecnico y de producto.

Estructura recomendada para nueva documentacion:
1. Proposito
2. Alcance
3. Componentes o modulos implicados
4. Contratos o datos relevantes
5. Restricciones o decisiones importantes
6. Pasos operativos o siguientes acciones, si aplica

Cuando actualices documentacion:
1. Verifica el codigo fuente relacionado antes de escribir.
2. Alinea la documentacion con `packages/shared`, `packages/database`, `apps/api` y `apps/web` segun corresponda.
3. Elimina lenguaje dudoso como "quizas", "posiblemente" o "en el futuro" si no aporta contexto real.
4. Si el cambio afecta arquitectura o datos, revisa tambien documentos vecinos en `docs/` y el `README.md`.

No hagas esto:
- No inventes endpoints, tablas o comportamientos no implementados.
- No mezcles decisiones futuras con estado actual sin marcarlo claramente.
- No conviertas la documentacion en un volcado largo del codigo.

Resultado esperado:
- Documentacion util para desarrollo diario.
- Facil de mantener.
- Coherente con el repo y con el dominio del producto.
