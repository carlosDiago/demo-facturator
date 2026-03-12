# Modelo inicial

## Identidad y acceso

- `users`: identidad de acceso
- `sessions`: sesiones persistidas
- `organizations`: unidad de negocio principal
- `organization_members`: membresias y roles

## Perfil fiscal

- `company_profiles`: datos fiscales del emisor para autonomos y sociedades en Espana

## Operativa comercial

- `clients`: agenda de clientes por organizacion
- `invoice_series`: series y correlativos
- `invoices`: cabecera de factura con snapshots fiscales
- `invoice_items`: lineas de factura
- `payments`: pagos parciales o completos

## Soporte y trazabilidad

- `attachments`: logos, PDFs y adjuntos
- `audit_logs`: eventos de dominio y actividad

## Restricciones importantes

- `users.email` unico
- `organizations.slug` unico
- `organization_members (organization_id, user_id)` unico
- `company_profiles.organization_id` unico
- `invoice_series (organization_id, code)` unico
- `invoices (organization_id, series_id, number)` unico

## Decisiones ya reflejadas

- emitida no editable
- cancelacion con motivo
- pagos sobre facturas no canceladas
- soporte para `self_employed` y `company`
- moneda inicial fija en `EUR`
