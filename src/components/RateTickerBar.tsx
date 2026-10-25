import React from 'react';
import { ScrapedRates, RateReferenceType, DisplayCurrencyMode } from '../types';
import { moneyVES } from '../utils/formatters';

interface RateTickerBarProps {
  rates: ScrapedRates;
  activeRateType: RateReferenceType;
  onChangeRateType: (type: RateReferenceType) => void;
  currencyMode: DisplayCurrencyMode;
  onChangeCurrencyMode: (mode: DisplayCurrencyMode) => void;
  onRefreshRates: () => Promise<void>;
  isRefreshing: boolean;
}

export const RateTickerBar: React.FC<RateTickerBarProps> = ({
  rates,
  activeRateType,
  onChangeRateType,
  currencyMode,
  onChangeCurrencyMode,
  onRefreshRates,
  isRefreshing,
}) => {
  return (
    <div className="rate-ticker-bar" role="region" aria-label="Control de tasas y monedas">
      <div className="rate-ticker-left">
        <span className="rate-ticker-label">🇻🇪 Tasa de cobro activa:</span>
        <div className="rate-ticker-badges">
          {/* Referencia Oficial BCV (USD) para compras y cobros */}
          <button
            type="button"
            className={`rate-badge ${activeRateType === 'bcv_usd' ? 'active' : ''}`}
            onClick={() => onChangeRateType('bcv_usd')}
            title="Tasa oficial BCV para compras en establecimientos fiscales y cobros en Bolívares"
          >
            <span className="rate-badge-title">🏛️ Oficial BCV:</span>
            <strong className="rate-badge-val">{moneyVES(rates.bcvUsd)}</strong>
            {activeRateType === 'bcv_usd' && <span className="rate-badge-dot" title="Tasa activa" />}
          </button>

          {/* Referencia Tasa Euro */}
          <button
            type="button"
            className={`rate-badge ${activeRateType === 'bcv_eur' ? 'active' : ''}`}
            onClick={() => onChangeRateType('bcv_eur')}
            title="Clic para usar la Tasa Euro para calcular precios en Bolívares"
          >
            <span className="rate-badge-title">🇪🇺 Tasa Euro:</span>
            <strong className="rate-badge-val">{moneyVES(rates.bcvEur)}</strong>
            {activeRateType === 'bcv_eur' && <span className="rate-badge-dot" title="Tasa activa" />}
          </button>

          {/* Referencia 3: Binance P2P USDT */}
          <button
            type="button"
            className={`rate-badge ${activeRateType === 'binance_p2p' ? 'active' : ''}`}
            onClick={() => onChangeRateType('binance_p2p')}
            title="Clic para usar la tasa promedio USDT Binance P2P para calcular precios en Bolívares"
          >
            <span className="rate-badge-title">🟡 Binance USDT:</span>
            <strong className="rate-badge-val">{moneyVES(rates.binanceP2PAvg)}</strong>
            {activeRateType === 'binance_p2p' && <span className="rate-badge-dot" title="Tasa activa" />}
          </button>

          {/* Botón actualizar en vivo */}
          <button
            type="button"
            className="rate-refresh-btn"
            onClick={onRefreshRates}
            disabled={isRefreshing}
            title="Actualizar cotizaciones en vivo"
          >
            {isRefreshing ? '↻ …' : '↻'}
          </button>
        </div>
      </div>

      {/* Selector de modo de moneda */}
      <div className="currency-toggle" role="group" aria-label="Moneda de visualización">
        <button
          type="button"
          className={currencyMode === 'USD' ? 'active' : ''}
          onClick={() => onChangeCurrencyMode('USD')}
          title="Ver valores en Dólares ($)"
        >
          $ USD
        </button>
        <button
          type="button"
          className={currencyMode === 'VES' ? 'active' : ''}
          onClick={() => onChangeCurrencyMode('VES')}
          title="Ver valores en Bolívares (Bs.)"
        >
          Bs. VES
        </button>
        <button
          type="button"
          className={currencyMode === 'BOTH' ? 'active' : ''}
          onClick={() => onChangeCurrencyMode('BOTH')}
          title="Ver valores en ambas monedas"
        >
          Ambos ($/Bs)
        </button>
      </div>
    </div>
  );
};
