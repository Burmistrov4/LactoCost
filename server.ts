import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // In-memory cache for live scraped exchange rates
  let cachedRates: any = null;
  let cacheTime = 0;
  const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

  // Endpoint to scrape and return both BCV (Euro & USD) and Binance P2P USDT rates
  app.get('/api/exchange-rates', async (_req, res) => {
    const now = Date.now();
    if (cachedRates && now - cacheTime < CACHE_TTL_MS) {
      return res.json({ status: 'ok', cached: true, ...cachedRates });
    }

    try {
      // 1. Scrape official BCV rates (EUR and USD)
      let bcvData: any = null;
      try {
        const bcvRes = await fetch('https://bcv.today/api/v1/rate.json', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(5000),
        });
        if (bcvRes.ok) {
          bcvData = await bcvRes.json();
        }
      } catch (err: any) {
        console.warn('BCV mirror warning:', err.message);
      }

      // 2. Scrape Binance P2P BUY & SELL rates
      let binanceBuyRate = 0;
      let binanceSellRate = 0;
      let p2pOffersCount = 0;

      try {
        const binanceBuyRes = await fetch(
          'https://www.binance.com/bapi/c2c/v1/public/c2c/agent/ad-list?fiat=VES&asset=USDT&tradeType=BUY&limit=10&order=1',
          {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            signal: AbortSignal.timeout(5000),
          }
        );
        if (binanceBuyRes.ok) {
          const buyJson: any = await binanceBuyRes.json();
          const items: any[] = buyJson?.data?.items || [];
          const validOffers = items.filter(
            (it) => it.price > 0 && (it.advertiser?.monthFinishRate ?? 1) >= 0.85
          );
          if (validOffers.length) {
            binanceBuyRate =
              validOffers.reduce((sum, o) => sum + Number(o.price), 0) / validOffers.length;
            p2pOffersCount += validOffers.length;
          }
        }
      } catch (err: any) {
        console.warn('Binance BUY warning:', err.message);
      }

      try {
        const binanceSellRes = await fetch(
          'https://www.binance.com/bapi/c2c/v1/public/c2c/agent/ad-list?fiat=VES&asset=USDT&tradeType=SELL&limit=10&order=0',
          {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            signal: AbortSignal.timeout(5000),
          }
        );
        if (binanceSellRes.ok) {
          const sellJson: any = await binanceSellRes.json();
          const items: any[] = sellJson?.data?.items || [];
          const validOffers = items.filter(
            (it) => it.price > 0 && (it.advertiser?.monthFinishRate ?? 1) >= 0.85
          );
          if (validOffers.length) {
            binanceSellRate =
              validOffers.reduce((sum, o) => sum + Number(o.price), 0) / validOffers.length;
            p2pOffersCount += validOffers.length;
          }
        }
      } catch (err: any) {
        console.warn('Binance SELL warning:', err.message);
      }

      const bcvEur = Number(bcvData?.EUR) || 991.16;
      const bcvUsd = Number(bcvData?.USD) || 881.07;
      const binanceP2PAvg =
        binanceBuyRate && binanceSellRate
          ? (binanceBuyRate + binanceSellRate) / 2
          : binanceBuyRate || binanceSellRate || 985.5;

      const rates = {
        bcvEur: Math.round(bcvEur * 100) / 100,
        bcvUsd: Math.round(bcvUsd * 100) / 100,
        bcvDate: bcvData?.date || new Date().toISOString().slice(0, 10),
        binanceP2PBuy: Math.round((binanceBuyRate || binanceP2PAvg) * 100) / 100,
        binanceP2PSell: Math.round((binanceSellRate || binanceP2PAvg) * 100) / 100,
        binanceP2PAvg: Math.round(binanceP2PAvg * 100) / 100,
        p2pOffersCount,
        fetchedAt: new Date().toISOString(),
        isLive: Boolean(bcvData || binanceBuyRate || binanceSellRate),
      };

      cachedRates = rates;
      cacheTime = now;
      res.json({ status: 'ok', cached: false, ...rates });
    } catch (error: any) {
      console.error('Error in /api/exchange-rates:', error);
      res.status(500).json({
        status: 'error',
        message: error.message,
        fallback: {
          bcvEur: 991.16,
          bcvUsd: 881.07,
          binanceP2PAvg: 985.5,
        },
      });
    }
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
