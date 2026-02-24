import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Calculator, ArrowRight, Sparkles, Target, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Orchestrated entrance animations
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, staggerChildren: 0.1 } 
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function WealthPlanner() {
  const [sipInput, setSipInput] = useState({ amount: 5000, rate: 12, years: 10 });
  const [sipResult, setSipResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Identity sync with the 'user' key
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Memoized compute function to ensure precision modeling
  const calculateSip = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/calculate-sip`, {
        params: { 
          amount: Number(sipInput.amount), 
          rate: Number(sipInput.rate), 
          years: Number(sipInput.years) 
        }
      });
      setSipResult(res.data);
    } catch (err) { 
      console.error("Authority Computation Failed:", err); 
    } finally {
      setLoading(false);
    }
  }, [sipInput]);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-8 pb-20"
    >
      {/* --- Page Header --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20 shadow-2xl">
            <TrendingUp className="text-emerald-500" size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
              Wealth <span className="text-emerald-500">Strategy</span>
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Authority Compound Engine v2.0</p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-[#0c121d] rounded-full border border-white/5 backdrop-blur-xl">
          <Sparkles size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precision Modeling Enabled</span>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* --- Parameter Input Console --- */}
        <aside className="xl:col-span-4">
          <motion.div variants={cardVariants} className="glass-card p-10 rounded-[3rem] border border-white/5 bg-[#0c121d]/40 shadow-2xl h-full">
            <div className="flex items-center gap-3 mb-10 opacity-50">
               <Zap size={14} className="text-emerald-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-white">Input Parameters</span>
            </div>
            
            <div className="space-y-8">
              {[
                { label: 'Monthly SIP (₹)', key: 'amount' },
                { label: 'Expected Return (%)', key: 'rate' },
                { label: 'Duration (Years)', key: 'years' }
              ].map((input) => (
                <div key={input.key} className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">{input.label}</label>
                  <input 
                    type="number" 
                    value={sipInput[input.key]} 
                    onChange={e => setSipInput({...sipInput, [input.key]: e.target.value})} 
                    className="w-full bg-slate-950 border border-white/5 p-5 rounded-2xl text-white font-black text-xl focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner" 
                  />
                </div>
              ))}
              
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={calculateSip} 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 border border-white/10"
              >
                {loading ? "COMPUTING..." : <>Execute Simulation <ArrowRight size={18} /></>}
              </motion.button>
            </div>
          </motion.div>
        </aside>

        {/* --- Visualization Node --- */}
        <main className="xl:col-span-8">
          <AnimatePresence mode="wait">
            {sipResult ? (
              <motion.div 
                key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Principal", val: sipResult.total_invested, icon: Target, color: "slate" },
                    { label: "Est. Returns", val: sipResult.estimated_returns, icon: Sparkles, color: "emerald" },
                    { label: "Final Corpus", val: sipResult.total_value, icon: TrendingUp, color: "blue" },
                  ].map((item, idx) => (
                    <div key={idx} className="glass-card p-6 rounded-[2rem] border border-white/5 bg-[#0c121d]/60 relative group overflow-hidden">
                       <div className="absolute -right-2 -top-2 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity"><item.icon size={80} /></div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{item.label}</p>
                       <p className={`text-2xl font-black tracking-tighter ${item.color === 'emerald' ? 'text-emerald-400' : 'text-white'}`}>
                         ₹{item.val.toLocaleString('en-IN')}
                       </p>
                    </div>
                  ))}
                </div>
                
                <div className="glass-card p-10 rounded-[3rem] border border-white/5 bg-[#0c121d]/40 h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sipResult.chart_data}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} dy={15} tickFormatter={(v) => `Yr ${v}`} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }}
                        itemStyle={{ color: '#10b981', fontWeight: '900' }}
                        formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, "Portfolio"]}
                      />
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fill="url(#colorValue)" />
                      <Area type="monotone" dataKey="invested" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-[650px] flex flex-col items-center justify-center text-center p-12 glass-card rounded-[3rem] border border-white/5 bg-[#0c121d]/20 shadow-inner"
              >
                <div className="p-10 bg-[#060b13] border border-white/5 rounded-full mb-8">
                  <Calculator size={64} className="text-slate-800" />
                </div>
                <h3 className="text-2xl font-black text-slate-400 uppercase italic tracking-tighter mb-4">Awaiting Simulation</h3>
                <p className="text-slate-600 max-w-sm font-bold text-sm leading-relaxed">
                  Adjust parameters and execute to visualize your compound interest journey.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}