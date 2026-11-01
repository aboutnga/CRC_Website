export interface MarketQuote { symbol:string; price:number; previousClose:number; asOf:string }
export const marketSymbols=['^GSPC','^DJI','^IXIC','^RUT','GC=F','BTC-USD'];
export const marketNames=['S&P 500','Dow 30','Nasdaq','Russell 2000','Gold','Bitcoin USD'];
export const initialMarkets:MarketQuote[] = [
  {
    "price": 7580.07,
    "previousClose": 7720.39,
    "asOf": "2026-10-30T20:47:43.0000000+00:00",
    "symbol": "^GSPC"
  },
  {
    "price": 51770.31,
    "previousClose": 52342.56,
    "asOf": "2026-10-30T20:47:53.0000000+00:00",
    "symbol": "^DJI"
  },
  {
    "price": 25436.998,
    "previousClose": 26184.725,
    "asOf": "2026-10-30T21:15:59.0000000+00:00",
    "symbol": "^IXIC"
  },
  {
    "price": 2811.8442,
    "previousClose": 2859.2166,
    "asOf": "2026-10-30T20:30:05.0000000+00:00",
    "symbol": "^RUT"
  },
  {
    "price": 3898.9,
    "previousClose": 4031.4,
    "asOf": "2026-10-30T20:59:59.0000000+00:00",
    "symbol": "GC=F"
  },
  {
    "price": 77954.2,
    "previousClose": 77440.93,
    "asOf": "2026-11-01T16:35:22.0000000+00:00",
    "symbol": "BTC-USD"
  }
];
export function parseMarketQuote(data:any,symbol:string):MarketQuote {
  const m=data?.chart?.result?.[0]?.meta;
  if(m?.symbol!==symbol || !Number.isFinite(m.regularMarketPrice) || m.regularMarketPrice<=0 || !Number.isFinite(m.chartPreviousClose) || m.chartPreviousClose<=0 || !Number.isFinite(m.regularMarketTime)) throw Error('Invalid Yahoo market quote');
  return {symbol,price:m.regularMarketPrice,previousClose:m.chartPreviousClose,asOf:new Date(m.regularMarketTime*1000).toISOString()};
}
export async function collectMarkets(previous:MarketQuote[]=initialMarkets):Promise<MarketQuote[]> {
  return Promise.all(marketSymbols.map(async symbol=>{
    const saved=previous.find(q=>q.symbol===symbol)??initialMarkets.find(q=>q.symbol===symbol)!;
    try {
      const response=await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,{signal:AbortSignal.timeout(12000)});
      if(!response.ok)throw Error(`Yahoo ${response.status}`);
      const quote=parseMarketQuote(await response.json(),symbol);
      return saved&&Date.parse(saved.asOf)>Date.parse(quote.asOf)?saved:quote;
    } catch { return saved; }
  }));
}

