import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, CartesianGrid, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Wallet, Zap, ArrowUpRight, 
  Target, ShieldAlert, HeartPulse, Clock, Globe, Newspaper, Activity
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Personal Postgres Telemetry
        if (user.email) {
          const analyticsRes = await axios.get(`http://localhost:8000/api/analytics/comprehensive`, {
            params: { email: user.email }
          }).catch(err => console.error("Postgres Analytics Error:", err));
          
          if (analyticsRes?.data) setData(analyticsRes.data);
        }

        // 2. Fetch Live Global Market News via GNews API
        const API_KEY = import.meta.env.VITE_GNEWS_API_KEY || '46eac4f68eb4f921514d5edc08af17f9';
        // 📍 UPGRADE: Changed max=3 to max=6 to pull more news items
        const gnewsUrl = `https://gnews.io/api/v4/top-headlines?category=business&lang=en&max=6&apikey=${API_KEY}`;
        
        const newsRes = await axios.get(gnewsUrl);
        
        if (newsRes.data && newsRes.data.articles) {
          const formattedNews = newsRes.data.articles.map(article => {
            // Dynamic Sentiment Analysis based on live headline text
            const text = article.title.toLowerCase();
            let sentiment = 'neutral';
            if (/(surge|rally|high|jump|gain|profit|bull|up|soar|record)/.test(text)) sentiment = 'bullish';
            else if (/(fall|drop|low|crash|loss|bear|down|cut|plunge|sink)/.test(text)) sentiment = 'bearish';

            // Format relative time (e.g., "Today")
            const pubDate = new Date(article.publishedAt);
            const timeString = pubDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return {
              title: article.title,
              category: article.source.name.toUpperCase().substring(0, 15),
              sentiment: sentiment,
              time: timeString,
              url: article.url
            };
          });
          setNews(formattedNews);
        }

      } catch (err) {
        console.error("Global Telemetry Synchronization Error:", err);
        // High-end fallback just in case the API rate limit is hit
        setNews([
          { title: "Global Markets Await Central Bank Guidance", category: "ECONOMY", sentiment: "neutral", time: "Live", url: "#" },
          { title: "Tech Sector Surges as AI Adoption Accelerates", category: "TECHNOLOGY", sentiment: "bullish", time: "Live", url: "#" },
          { title: "Commodity Prices Drop Amid Supply Chain Fixes", category: "MARKETS", sentiment: "bearish", time: "Live", url: "#" },
          { title: "Venture Capital Injections Hit Record High in Q3", category: "VENTURE", sentiment: "bullish", time: "Live", url: "#" },
          { title: "Housing Market Shows Signs of Cooling", category: "REAL ESTATE", sentiment: "bearish", time: "Live", url: "#" },
          { title: "New Trade Agreements Spark International Rally", category: "GLOBAL", sentiment: "bullish", time: "Live", url: "#" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.email]);

  const getHealthColor = (score) => {
    if (score > 80) return 'text-emerald-500';
    if (score > 50) return 'text-blue-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-emerald-500 gap-4 pt-40">
        <Zap className="animate-spin" size={32} />
        <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing Telemetry...</span>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 max-w-7xl mx-auto pb-20 font-inter"
    >
      {/* --- Header & Health Status --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/40 pb-10">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Financial <span className="text-emerald-500">Intelligence</span>
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] flex items-center gap-2">
            <Activity size={14} className="text-emerald-500" /> Predictive modeling & live market sync active
          </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-900/40 p-4 rounded-3xl border border-white/5 shadow-2xl">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Health Score</p>
            <p className={`text-3xl font-black italic leading-none ${getHealthColor(data?.summary?.health_score)}`}>
              {data?.summary?.health_score || '0'}<span className="text-xs text-slate-700 ml-1">/100</span>
            </p>
          </div>
          <div className="h-12 w-[1px] bg-slate-800" />
          <HeartPulse className={getHealthColor(data?.summary?.health_score)} size={32} />
        </div>
      </div>

      {/* --- The Bento Grid (Core Metrics) --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Net Worth", val: data?.summary?.net_worth, icon: Wallet, color: "blue", suffix: "" },
          { title: "Monthly Surplus", val: data?.summary?.monthly_surplus, icon: Zap, color: "emerald", suffix: "" },
          { title: "Survival Runway", val: data?.summary?.emergency_fund_months, icon: Clock, color: "amber", suffix: " Months" },
          { title: "Goal Progress", val: data?.goals?.completion_percentage, icon: Target, color: "purple", suffix: "%" }
        ].map((m, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="glass-card p-6 rounded-[2rem] border-l-2 border-l-white/5 bg-[#0c121d] relative group overflow-hidden"
          >
            <div className={`absolute -right-2 -top-2 w-16 h-16 bg-${m.color}-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex justify-between items-start mb-6">
               <div className={`p-2.5 bg-${m.color}-500/10 rounded-xl text-${m.color}-500 border border-${m.color}-500/20`}>
                 <m.icon size={20} />
               </div>
               <ArrowUpRight className="text-slate-800 group-hover:text-slate-500 transition-colors" size={16} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{m.title}</p>
            <h3 className="text-2xl font-black text-white italic">
              {m.val !== undefined ? `${i < 2 ? '₹' : ''}${m.val.toLocaleString('en-IN')}${m.suffix}` : "0"}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* --- Middle Row: Chart & Buffer --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart: Compound Growth Simulation */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 glass-card p-8 md:p-10 rounded-[3rem] bg-[#0c121d] border border-white/5 relative overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between mb-12">
            <div>
              <h4 className="font-black text-xl text-white italic uppercase tracking-tight">Growth Trajectory</h4>
              <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-1">10-Year Projections @ 12% CAGR</p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.projections?.chart_data || []}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                <XAxis dataKey="year" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0f172a]/90 border border-emerald-500/20 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                          <p className="text-slate-400 text-[9px] font-black uppercase mb-1 tracking-widest">Year {payload[0].payload.year}</p>
                          <p className="text-emerald-400 font-black text-xl italic">₹{payload[0].value.toLocaleString('en-IN')}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fill="url(#areaGradient)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Side Insights: The "Runway" Meter */}
        <motion.div variants={itemVariants} className="space-y-8">
           <div className="glass-card p-10 rounded-[3rem] border border-white/5 bg-[#0c121d] h-full flex flex-col justify-center text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
              <ShieldAlert className="text-amber-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]" size={48} />
              <h5 className="text-white font-black italic uppercase tracking-tight mb-2">Liquidity Buffer</h5>
              <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-8">
                Based on current burn rate, your capital preserves your lifestyle for:
              </p>
              <div className="relative inline-block mx-auto mb-4">
                 <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full" />
                 <h1 className="relative text-6xl font-black text-amber-500 italic drop-shadow-md">
                   {data?.summary?.emergency_fund_months || '0'}
                   <span className="text-lg text-slate-600 ml-2 not-italic font-bold">Mo</span>
                 </h1>
              </div>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Stability Threshold: 6 Months</p>
           </div>
        </motion.div>
      </div>

      {/* --- Bottom Row: LIVE Global Market News Feed --- */}
      <motion.div variants={itemVariants} className="pt-6">
        <div className="flex items-center gap-3 mb-6 px-2">
          <Globe className="text-blue-500" size={24} />
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Live <span className="text-blue-500">Telemetry</span></h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -5 }}
              onClick={() => window.open(item.url, '_blank')}
              className="glass-card p-6 bg-[#0c121d] rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                    item.sentiment === 'bullish' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    item.sentiment === 'bearish' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}>
                    {item.category}
                  </span>
                  <span className="text-slate-600 text-[10px] font-bold flex items-center gap-1">
                    <Clock size={12} /> {item.time}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors leading-relaxed line-clamp-3 mb-4">
                  {item.title}
                </h4>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity mt-4">
                <Newspaper size={14} /> Read Full Report
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}