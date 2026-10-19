# Motor inicial de costos

Este directorio contiene el primer componente ejecutable del proyecto: un motor de fórmulas aislado de la interfaz y de la persistencia.

## Requisitos
- Python 3.10 o superior (solo biblioteca estándar para esta fase).
- Ejecutar desde la raíz del proyecto:
  `python -m unittest discover -s tests -v`

## Funciones
- CPP ponderado de partidas comparables.
- CPP móvil después de una recepción con descuentos y cargos atribuibles.
- Valoración de salida al CPP vigente.
- Costo por cantidad aprovechable y costo por unidad vendible.
- Precio objetivo según margen sobre ventas y markup sobre costo (`core/costing.py`).
- Calculadora de precio por margen objetivo con `Decimal`, comisión porcentual, cargos variables fijos, impuesto añadido como escenario explícito y redondeo configurable (`core/pricing.py`).
- Conversión estricta a micro-unidades, comprobación de rango INTEGER int64 y costo extendido sin multiplicación binaria/SQL (`core/storage_units.py`).
- Contribución unitaria y sugerencia de compra.

## Límites conocidos
- Aún no hay base de datos, autenticación, interfaz web, integración de proveedores ni inventario persistente.
- La función no convierte monedas ni unidades; esas operaciones requieren tasa/factor documentados.
- La fórmula de compra espera que pedidos comprometidos sean demanda adicional, para evitar duplicarlos con la demanda proyectada.
- No usar en producción hasta integrar movimientos transaccionales, auditoría, autorización, pruebas de integración y respaldo.
- Los resultados dependen de que las unidades sean homogéneas y los importes se introduzcan correctamente.


## Tasas de cambio — D-018

`app/core/exchange_rates.py` contiene lógica pura sin red: validación de decimales, agregación de muestra P2P con filtros y conversión de importe con redondeo explícito. Los adaptadores de fuente viven en `spikes/cloudflare-d1/src/exchange-rates.js`; no mezclar consultas HTTP con el motor financiero. Pruebas: `tests/test_exchange_rates.py`. Ver `docs/decisiones/D-018_TASAS_CAMBIO_Y_FUENTES.md` para límites de las fuentes, significado BUY/SELL, frescura y política de uso.
