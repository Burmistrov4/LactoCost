# D-020 — Contrato de comandos de inventario y moneda de valoración

**Fecha:** 2026-10-09  
**Estado:** primera capa de validación implementada; persistencia transaccional pendiente.  
**Ámbito:** spike local Workers + D1.

## Decisión de seguridad y exactitud

No se debe escribir un movimiento directamente desde datos JSON sin validación de dominio. El módulo `src/domain/inventory-command.js` valida el comando antes de cualquier I/O: identidad del actor suministrada por contexto confiable, motivo obligatorio, idempotency key, tipo y signo del movimiento, enteros seguros, costos no negativos, coherencia entre cantidad/costo/total, moneda de valoración y referencias de reverso.

La moneda física del stock no se particiona por divisa. En cambio, el CPP sí es una magnitud monetaria y debe mantenerse en una moneda de valoración explícita. Por ello, el movimiento debe llegar valorizado en esa moneda. Si el origen está en otra moneda, se exige una referencia a `exchange_rate_applications` ya registrada. El servicio de persistencia debe verificar que esa aplicación existe y corresponde a la entidad, importe, monedas, tasa y política utilizadas; el validador puro solo comprueba que se proporcione el identificador.

## Límites actuales

- El módulo es puro, no consulta la base y **no autoriza** al actor.
- No inserta movimientos, snapshots, aplicaciones de tasa ni auditoría.
- No resuelve concurrencia ni rollback.
- El contexto `actorId` solo es confiable si el middleware futuro lo deriva de una identidad verificada en el servidor.
- El módulo no debe conectarse a una ruta HTTP mutable hasta completar D-019, el servicio transaccional y sus pruebas de fallo/rollback.

## Siguiente criterio de aceptación

Implementar un servicio que, dentro de una operación D1 atómica, verifique la idempotency key y las referencias financieras, inserte el movimiento, calcule CPP con moneda consistente, guarde snapshot y evento de auditoría, y falle sin escrituras parciales ante cualquier error. Añadir pruebas de repetición, saldo concurrente, falla de auditoría, falla de snapshot y reintento.
