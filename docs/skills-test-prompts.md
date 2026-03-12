# Skills test prompts

Prompts de prueba para verificar si OpenCode esta descubriendo y usando las skills del repo.

Ejecuta las pruebas desde la raiz del proyecto para que el agente pueda descubrir `.opencode/skills/` y `.claude/skills/`.

## repo-architecture

Prompt:

```text
Quiero anadir gestion de borradores de factura; dime que partes deberian vivir en web, api, shared y database antes de implementar nada.
```

Senales esperadas:

- separa claramente `apps/web`, `apps/api`, `packages/shared` y `packages/database`
- propone una division por capas en vez de mezclar implementacion y persistencia

## facturacion-backend

Prompt:

```text
Anade un endpoint para emitir facturas respetando las reglas actuales del dominio y la trazabilidad existente.
```

Senales esperadas:

- menciona estados como `draft` y `issued`
- revisa restricciones del dominio antes de implementar
- tiene en cuenta series, correlativos o trazabilidad

## forms-and-validation

Prompt:

```text
Crea el formulario de alta de cliente reutilizando contratos y validacion compartida entre frontend y backend.
```

Senales esperadas:

- propone reutilizar o crear schemas en `packages/shared`
- mantiene nombres de campos consistentes entre UI y API
- evita validaciones duplicadas con reglas distintas

## ask-questions-if-underspecified

Prompt con ambiguedad material:

```text
Integra pagos reales para las facturas.
```

Senales esperadas:

- hace una sola pregunta concreta
- incluye una recomendacion por defecto
- explica brevemente que cambiaria segun la respuesta

Prompt con contexto suficiente:

```text
Anade validacion al perfil fiscal usando el patron existente.
```

Senales esperadas:

- avanza sin pedir permiso innecesario
- sigue patrones existentes del repo

## drizzle-migrations

Prompt:

```text
Necesito anadir un nuevo campo fiscal al perfil de empresa y dejar esquema, migracion y seed coherentes.
```

Senales esperadas:

- menciona `packages/database/src/schema/index.ts`
- contempla migracion y seed
- revisa impacto en `packages/shared` y `apps/api` si aplica

## documentation-guidelines

Prompt:

```text
Documenta el modulo de company profile del proyecto siguiendo las convenciones de documentacion del repo.
```

Senales esperadas:

- estructura la documentacion de forma clara
- usa nombres reales del repo
- no inventa endpoints ni comportamiento no implementado

## Como interpretar el resultado

Indicadores de que una skill se esta usando:

- la respuesta sigue muy de cerca el enfoque de la skill
- aparecen rutas y reglas del repo alineadas con la skill
- el agente pregunta menos, pero mejor, cuando falta contexto
- si OpenCode muestra trazas de herramientas, puede aparecer la carga del tool `skill`

Si una skill no parece activarse:

1. ajusta su `description` para hacerla mas especifica
2. prueba un prompt mas alineado con esa descripcion
3. verifica que OpenCode este abierto desde la raiz del repositorio
