import React, { useState } from 'react';
import { ViewId, Product, InventoryItem, InventoryMovement } from '../types';
import { money } from '../utils/formatters';
import { calculateTargetPrice } from '../domain/pricing';

interface DashboardViewProps {
  products: Product[];
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  onNavigate: (view: ViewId) => void;
  onSelectProductForPricing?: (productId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  inventory,
  movements,
  onNavigate,
}) => {
  const [selectedRange, setSelectedRange] = useState<'7' | '30' | '90'>('30');

  // Dynamic calculations based on state
  const totalInventoryValue = inventory.reduce(
    (sum, item) => sum + item.currentStock * item.unitCost,
    0
  );

  const healthyCount = inventory.filter((i) => i.status === 'good').length;
  const warningCount = inventory.filter((i) => i.status === 'warn').length;
  const criticalCount = inventory.filter((i) => i.status === 'bad').length;
  const totalRefs = inventory.length;

  const healthyPct = totalRefs ? Math.round((healthyCount / totalRefs) * 100) : 0;
  const warningPct = totalRefs ? Math.round((warningCount / totalRefs) * 100) : 0;
  const criticalPct = totalRefs ? Math.round((criticalCount / totalRefs) * 100) : 0;

  // Chart data points adjusted for range
  const rangeMultiplier = selectedRange === '7' ? 0.28 : selectedRange === '90' ? 2.8 : 1.0;
  const salesDisplay = money(186420 * rangeMultiplier);
  const stockDisplay = money(totalInventoryValue);

  return (
    <section className="view-state active overview" id="view-dashboard">
      <div className="section-heading">
        <div>
          <h2>Resumen ejecutivo</h2>
          <p>Lectura rápida de salud operativa, costos y próximos pasos.</p>
        </div>
        <div className="range" aria-label="Periodo del dashboard">
          <button
            className={selectedRange === '7' ? 'active' : ''}
            onClick={() => setSelectedRange('7')}
          >
            7 días
          </button>
          <button
            className={selectedRange === '30' ? 'active' : ''}
            onClick={() => setSelectedRange('30')}
          >
            30 días
          </button>
          <button
            className={selectedRange === '90' ? 'active' : ''}
            onClick={() => setSelectedRange('90')}
          >
            90 días
          </button>
        </div>
      </div>

      <div className="kpis">
        <article className="card kpi">
          <div className="kpi-top">
            Ventas netas <span className="kpi-icon">↗</span>
          </div>
          <div className="kpi-value" id="kpiSales">
            {salesDisplay}
          </div>
          <div className="kpi-foot">
            <span className="up">↗ 8,4%</span> vs. periodo anterior <span style={{ color: '#a0aaa2' }}>(demo)</span>
          </div>
          <div className="kpi-line">
            <span style={{ width: '74%' }}></span>
          </div>
        </article>

        <article className="card kpi">
          <div className="kpi-top">
            Margen de contribución <span className="kpi-icon">◉</span>
          </div>
          <div className="kpi-value" id="kpiMargin">
            34,8%
          </div>
          <div className="kpi-foot">
            <span className="up">+2,1 pp</span> sobre el periodo anterior
          </div>
          <div className="kpi-line">
            <span style={{ width: '58%' }}></span>
          </div>
        </article>

        <article className="card kpi">
          <div className="kpi-top">
            Valor del inventario <span className="kpi-icon">▦</span>
          </div>
          <div className="kpi-value" id="kpiStock">
            {stockDisplay}
          </div>
          <div className="kpi-foot">
            <span className="down">{criticalCount + warningCount} alertas</span> requieren revisión
          </div>
          <div className="kpi-line">
            <span style={{ width: '46%' }}></span>
          </div>
        </article>

        <article className="card kpi">
          <div className="kpi-top">
            Costo promedio ponderado <span className="kpi-icon">⌁</span>
          </div>
          <div className="kpi-value" id="kpiCpp">
            Bs. 1.284
          </div>
          <div className="kpi-foot">
            <span className="down">+3,6%</span> variación del costo de insumos
          </div>
          <div className="kpi-line">
            <span style={{ width: '63%' }}></span>
          </div>
        </article>
      </div>

      <div className="content-grid">
        <article className="card panel">
          <div className="panel-title">
            <div>
              <h3>Rendimiento del negocio</h3>
              <p>Ingresos frente a costo variable · Bs. simulados</p>
            </div>
            <button className="small-link" id="chartDetails" onClick={() => onNavigate('pricing')}>
              Ver análisis ↗
            </button>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-dot" style={{ background: '#33795d' }}></i>Ventas netas
            </span>
            <span>
              <i className="legend-dot" style={{ background: '#d2a84c' }}></i>Costo variable
            </span>
          </div>
          <div className="chart-wrap">
            <svg
              viewBox="0 0 600 210"
              role="img"
              aria-label="Gráfico de demostración de ventas netas y costos variables"
            >
              <defs>
                <linearGradient id="fillGreen" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#77b894" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#77b894" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line className="gridline" x1="40" y1="25" x2="590" y2="25" />
              <line className="gridline" x1="40" y1="65" x2="590" y2="65" />
              <line className="gridline" x1="40" y1="105" x2="590" y2="105" />
              <line className="gridline" x1="40" y1="145" x2="590" y2="145" />
              <line className="gridline" x1="40" y1="185" x2="590" y2="185" />
              <text className="axis" x="3" y="29">200k</text>
              <text className="axis" x="3" y="69">150k</text>
              <text className="axis" x="3" y="109">100k</text>
              <text className="axis" x="10" y="149">50k</text>
              <text className="axis" x="23" y="189">0</text>
              <path
                id="salesArea"
                className="chart-fill"
                d="M40 135 L118 120 L196 129 L274 89 L352 100 L430 62 L508 72 L586 35 L586 185 L40 185 Z"
              />
              <path
                id="salesLine"
                className="chart-line"
                d="M40 135 L118 120 L196 129 L274 89 L352 100 L430 62 L508 72 L586 35"
              />
              <path
                id="costLine"
                className="chart-line2"
                d="M40 157 L118 149 L196 155 L274 128 L352 132 L430 105 L508 110 L586 87"
              />
              <circle className="chart-point" cx="586" cy="35" r="4" />
              <text className="axis" x="40" y="205">Sem. 1</text>
              <text className="axis" x="188" y="205">Sem. 2</text>
              <text className="axis" x="338" y="205">Sem. 3</text>
              <text className="axis" x="500" y="205">Sem. 4</text>
            </svg>
          </div>
          <div className="insight">
            <div className="insight-icon">✳</div>
            <div>
              <small>Insight automático · simulación</small>
              <p id="insightText">
                El costo de insumos crece más rápido que el objetivo.{' '}
                <b>Revisa leche y envases</b> antes de aprobar la próxima compra.
              </p>
            </div>
          </div>
        </article>

        <article className="card panel">
          <div className="panel-title">
            <div>
              <h3>Salud del inventario</h3>
              <p>Distribución por estado · unidades del sistema</p>
            </div>
            <button className="small-link" onClick={() => onNavigate('inventory')}>
              Ver inventario ↗
            </button>
          </div>
          <div className="health">
            <div className="donut">
              <div className="donut-center">
                <strong>{totalRefs}</strong>
                <span>referencias</span>
              </div>
            </div>
            <div className="stock-legend">
              <div className="stock-row">
                <span>
                  <i style={{ background: '#3c8866' }}></i>Saludable
                </span>
                <b>{healthyCount} · {healthyPct}%</b>
              </div>
              <div className="stock-row">
                <span>
                  <i style={{ background: '#d8e9a4' }}></i>Vigilar
                </span>
                <b>{warningCount} · {warningPct}%</b>
              </div>
              <div className="stock-row">
                <span>
                  <i style={{ background: '#f2c76c' }}></i>Bajo mínimo
                </span>
                <b>{criticalCount} · {criticalPct}%</b>
              </div>
            </div>
          </div>
          <div className="divider"></div>
          <div className="alert-title">
            Prioridades inteligentes <span>{criticalCount + warningCount} pendientes</span>
          </div>
          <div className="alert">
            <div className="alert-symbol red">!</div>
            <div className="alert-copy">
              <strong>Leche pasteurizada · stock crítico</strong>
              <p>Existencia actual: 45 L (mínimo 80 L). Requiere reposición inmediata.</p>
            </div>
            <button className="tiny-action" onClick={() => onNavigate('purchases')}>
              Revisar
            </button>
          </div>
          <div className="alert">
            <div className="alert-symbol">◷</div>
            <div className="alert-copy">
              <strong>Fresas · riesgo de merma</strong>
              <p>Existencia 18 kg (mínimo 25 kg). Priorizar en lote yogurt fresa.</p>
            </div>
            <button className="tiny-action" onClick={() => onNavigate('production')}>
              Ver lote
            </button>
          </div>
        </article>
      </div>

      <div className="bottom-grid">
        <article className="card panel">
          <div className="panel-title">
            <div>
              <h3>Operaciones recientes</h3>
              <p>Registro continuo de recepciones, producción y ajustes.</p>
            </div>
            <button className="small-link" id="activityBtn" onClick={() => onNavigate('reports')}>
              Ver historial ↗
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Operación</th>
                  <th>Referencia</th>
                  <th>Importe</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((mov) => (
                  <tr key={mov.id}>
                    <td>
                      <div className="product">
                        <div className="product-icon">
                          {mov.type === 'receipt' ? '🥛' : mov.type === 'production_consumption' ? '🍓' : '🧀'}
                        </div>
                        <div>
                          <b>{mov.itemName}</b>
                          <small>{mov.date}</small>
                        </div>
                      </div>
                    </td>
                    <td>{mov.reference}</td>
                    <td>{money(mov.totalCost, mov.currency)}</td>
                    <td>
                      <span className={`status ${mov.status}`}>{mov.statusText}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card panel">
          <div className="panel-title">
            <div>
              <h3>Radar de rentabilidad</h3>
              <p>Precio objetivo calculado con supuestos de ejemplo.</p>
            </div>
            <button className="small-link" onClick={() => onNavigate('pricing')}>
              Abrir precios ↗
            </button>
          </div>
          <div className="price-list">
            {products.map((prod) => {
              const calc = calculateTargetPrice(prod.cost, prod.targetMargin);
              return (
                <div className="price-item" key={prod.id}>
                  <div className="price-emoji">{prod.emoji}</div>
                  <div className="price-info">
                    <strong>{prod.name} · {prod.format}</strong>
                    <small>Costo variable: {money(prod.cost)}</small>
                  </div>
                  <div className="price-number">
                    <strong id={`radar-price-${prod.id}`}>{money(calc.netPrice)}</strong>
                    <small id={`radar-margin-${prod.id}`}>Margen {prod.targetMargin.toFixed(1)}%</small>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="insight" style={{ background: '#edf5e9', color: '#284634', marginTop: '12px' }}>
            <div className="insight-icon" style={{ background: '#d6eeb9' }}>↗</div>
            <div>
              <small style={{ color: '#50715a' }}>Sugerencia del sistema</small>
              <p style={{ color: '#3b5b45' }}>
                No uses el precio sugerido hasta cargar costos reales, rendimiento vendible y comisiones de cada canal.
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
