import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, CartesianGrid, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Wallet, Zap, ArrowUpRight, 
  Target, ShieldAlert, HeartPulse, Clock 
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
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('userPersona') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/analytics/comprehensive`, {
          params: { email: user.email }
        });
        setData(res.data);
      } catch (err) {
        console.error("Analytics Synchronization Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.email]);

  const getHealthColor = (score) => {
    if (score > 80) return 'text-emerald-500';
    if (score > 50) return 'text-blue-500';
    return 'text-red-500';
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 max-w-7xl mx-auto pb-20"
    >
      {/* --- Header & Health Status --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/40 pb-10">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Financial <span className="text-emerald-500">Intelligence</span>
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">
            Predictive modeling & risk assessment active
          </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-900/40 p-4 rounded-3xl border border-white/5">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Health Score</p>
            <p className={`text-3xl font-black italic leading-none ${getHealthColor(data?.summary?.health_score)}`}>
              {data?.summary?.health_score || '--'}<span className="text-xs text-slate-700 ml-1">/100</span>
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
            className="glass-card p-6 rounded-[2rem] border-l-2 border-l-white/5 relative group"
          >
            <div className={`absolute -right-2 -top-2 w-16 h-16 bg-${m.color}-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex justify-between items-start mb-6">
               <div className={`p-2.5 bg-${m.color}-500/10 rounded-xl text-${m.color}-500`}>
                 <m.icon size={20} />
               </div>
               <ArrowUpRight className="text-slate-800 group-hover:text-slate-500 transition-colors" size={16} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{m.title}</p>
            <h3 className="text-2xl font-black text-white italic">
              {m.val !== undefined ? `${i < 2 ? '₹' : ''}${m.val.toLocaleString('en-IN')}${m.suffix}` : "---"}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* --- Main Chart: Compound Growth Simulation --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 glass-card p-10 rounded-[3rem] border border-white/5 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-12">
            <div>
              <h4 className="font-black text-xl text-white italic uppercase tracking-tight">Growth Trajectory</h4>
              <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">10-Year Projections @ 12% CAGR</p>
            </div>
            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-blue-500">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.projections?.chart_data}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="year" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0f172a] border border-white/5 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                          <p className="text-slate-500 text-[9px] font-black uppercase mb-1 tracking-widest">Projection: Year {payload[0].payload.year}</p>
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

        {/* --- Side Insights: The "Runway" Meter --- */}
        <motion.div variants={itemVariants} className="space-y-8">
           <div className="glass-card p-10 rounded-[3rem] border border-white/5 h-full flex flex-col justify-center text-center">
              <ShieldAlert className="text-amber-500 mx-auto mb-6" size={48} />
              <h5 className="text-white font-black italic uppercase tracking-tight mb-2">Liquidity Buffer</h5>
              <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8">
                Based on current expenses, your capital preserves your lifestyle for:
              </p>
              <div className="relative inline-block mx-auto mb-4">
                 <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
                 <h1 className="relative text-6xl font-black text-amber-500 italic">
                   {data?.summary?.emergency_fund_months || '0'}
                   <span className="text-lg text-slate-700 ml-2">Mo</span>
                 </h1>
              </div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Stability Threshold: 6 Months</p>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
}