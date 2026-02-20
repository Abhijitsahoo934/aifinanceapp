import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart3, RefreshCcw, TrendingUp, Newspaper, ExternalLink } from 'lucide-react';

export default function Market() {
  const [market, setMarket] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  const GNEWS_API_KEY = "46eac4f68eb4f921514d5edc08af17f9";

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Market Status from your local FastAPI backend
      const marketRes = await axios.get('http://127.0.0.1:8000/api/market-status');
      setMarket(marketRes.data);

      // 2. Fetch Indian Financial News from GNews
      const newsRes = await axios.get(`https://gnews.io/api/v4/top-headlines`, {
        params: {
          category: 'business',
          country: 'in',
          lang: 'en',
          apikey: GNEWS_API_KEY,
          max: 5
        }
      });
      setNews(newsRes.data.articles);
    } catch (err) { 
      console.error("Data Fetch Error:", err); 
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-emerald-500" size={28} />
          <h2 className="text-2xl font-bold font-inter">Market Intelligence</h2>
        </div>
        <button onClick={fetchData} className="p-2 hover:bg-slate-800 rounded-full transition-all active:scale-95">
          <RefreshCcw className={loading ? 'animate-spin text-emerald-500' : 'text-slate-400'} size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Market Index Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 rounded-3xl">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Primary Index</p>
            <h3 className="text-3xl font-black mb-4">{market?.index || 'NIFTY 50'}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">₹{market?.price || '22,450'}</span>
              <span className={`text-sm font-bold ${market?.status === 'STABLE' ? 'text-emerald-500' : 'text-red-500'}`}>
                • {market?.status || 'SYNCING'}
              </span>
            </div>
          </div>

          <div className="bg-emerald-600/5 border border-emerald-500/20 p-8 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-emerald-500" size={20} />
              <h4 className="font-bold text-emerald-500 uppercase tracking-widest text-[10px]">Llama AI Strategy</h4>
            </div>
            <p className="text-lg font-medium text-slate-300 leading-relaxed italic">
              "{market?.recommendation || 'Analyzing volatility to generate your customized SIP strategy...'}"
            </p>
          </div>
        </div>

        {/* Right: Live GNews Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <Newspaper className="text-blue-500" size={20} />
            <h4 className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Live Indian Business Wire</h4>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {news.length > 0 ? news.map((article, index) => (
              <a 
                key={index} 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block glass-card p-5 rounded-2xl hover:bg-slate-800/60 transition-all group border-l-4 border-l-transparent hover:border-l-emerald-500"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-blue-500 uppercase">
                        {article.source.name}
                      </span>
                      <span className="text-[10px] text-slate-600">•</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors leading-snug text-base">
                      {article.title}
                    </h5>
                    <p className="text-xs text-slate-400 line-clamp-2">{article.description}</p>
                  </div>
                  <ExternalLink size={16} className="text-slate-700 group-hover:text-white mt-1 shrink-0" />
                </div>
              </a>
            )) : (
              <div className="p-12 text-center text-slate-600 border border-dashed border-slate-800 rounded-3xl italic">
                {loading ? "Decrypting news wires..." : "Connect to internet to see live updates."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}