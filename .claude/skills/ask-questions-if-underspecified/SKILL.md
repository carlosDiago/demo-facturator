---
name: ask-questions-if-underspecified
description: Pide aclaraciones solo cuando una peticion sea materialmente ambigua, tenga riesgo o no permita elegir un default seguro
---

Usa esta skill cuando la peticion del usuario este incompleta de una forma que cambie de manera importante la implementacion, el riesgo o el resultado.

No la uses para pedir permiso innecesario ni para frenar cambios pequenos cuando existe un default razonable.

Cuando falte contexto:
1. Haz primero todo el trabajo no bloqueado: revisar el repo, leer contratos, inferir convenciones y detectar defaults seguros.
2. Formula como maximo una pregunta concreta y orientada a destrabar el trabajo.
3. Incluye una recomendacion por defecto.
4. Explica brevemente que cambiaria segun la respuesta.

Pide aclaracion solo si ocurre al menos una de estas situaciones:
- La ambiguedad cambia arquitectura, modelo de datos, API o UX de forma relevante.
- La accion es destructiva, irreversible o toca produccion, seguridad o facturacion real.
- Falta un secreto, credencial, identificador o dato externo que no se puede inferir.
- Hay varias opciones validas y el repo no da suficiente contexto para elegir una con seguridad.

No preguntes cuando:
- Puedes seguir un patron existente del repo.
- Puedes implementar un primer paso reversible.
- La diferencia es menor y no afecta la intencion principal.
- La pregunta seria del tipo "quieres que continue?" o "quieres que ejecute tests?".

Formato recomendado de aclaracion:
- Que falta exactamente.
- Default recomendado.
- Impacto de elegir otra opcion.

Ejemplo breve:
"Me falta decidir si esto debe vivir en `apps/api` o en `packages/shared`. Mi recomendacion es poner el contrato en `packages/shared` y dejar la logica en `apps/api`, porque asi evitamos duplicacion. Si prefieres una solucion solo local al backend, el cambio quedaria acotado pero perderiamos reutilizacion en `web`."
