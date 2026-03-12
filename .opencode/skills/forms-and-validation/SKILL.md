---
name: forms-and-validation
description: Guia para formularios y validaciones compartidas con Zod y contratos comunes en web y api
---

Usa esta skill cuando implementes formularios, payloads o validaciones de entrada en frontend y backend.

Reglas principales:
1. Define o reutiliza schemas Zod en `packages/shared` siempre que el dato cruce capas.
2. Usa el mismo contrato para validar en frontend y backend cuando sea posible.
3. Mantiene consistencia entre tipos inferidos y payloads reales.
4. Prefiere campos opcionales y nullables siguiendo las convenciones ya usadas en el proyecto.

Patrones a seguir en este repo:
- Los schemas compartidos viven en `packages/shared/src/schemas/index.ts`.
- El frontend ya usa `react-hook-form`, `@hookform/resolvers` y `zod`.
- El backend ya normaliza campos opcionales a `null` cuando persiste datos, como en perfil de empresa.

Al crear o cambiar un formulario:
1. Revisa si ya existe un schema reutilizable.
2. Si no existe, crea el schema en `packages/shared` antes de implementarlo en la UI o la API.
3. Usa nombres de campo alineados con el contrato compartido.
4. Si hay numeros o porcentajes, decide claramente si llegan como string o numero y normalizalos de forma consistente.
5. Si un campo opcional se guarda en base de datos, convierte `undefined` a `null` cuando aplique.

Checklist de calidad:
- Errores legibles para usuario y consistentes con el dominio.
- Sin validaciones duplicadas con reglas distintas.
- Tipos inferidos desde Zod en lugar de tipos manuales innecesarios.
