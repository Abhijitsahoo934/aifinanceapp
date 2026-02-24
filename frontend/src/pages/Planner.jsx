import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Calendar, Wallet, ArrowUpRight, Sparkles, Activity,
  Landmark, ShieldAlert, Save, RefreshCw, CheckCircle2, AlertCircle, PieChart
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function Planner() {
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'telemetry'
  
  // --- SIP SIMULATOR STATE ---
  const [params, setParams] = useState({
    amount: 5000, rate: 12, years: 10, step_up: 10
  });
  const [projection, setProjection] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- PORTFOLIO TELEMETRY STATE ---
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [portfolio, setPortfolio] = useState({
    income: 0, expenses: 0, savings: 0, investments: 0
  });
  const [syncStatus, setSyncStatus] = useState({ state: 'idle', msg: '' }); // idle | loading | success | error

  // --- ENGINE SYNC (SIMULATOR) ---
  const fetchProjection = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/calculate-sip', {
        params: {
          amount: params.amount, rate: params.rate, years: params.years, step_up: params.step_up
        }
      });
      setProjection(res.data);
    } catch (err) {
      console.error("Projection Engine Offline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'simulator') fetchProjection();
    }, 500); 
    return () => clearTimeout(timer);
  }, [params.amount, params.rate, params.years, params.step_up, activeTab]);

  // --- FETCH EXISTING PORTFOLIO ---
  useEffect(() => {
    if (activeTab === 'telemetry' && user.email) {
      axios.get('http://localhost:8000/api/analytics/comprehensive', { params: { email: user.email } })
        .then(res => {
          if (res.data?.summary) {
            // Reverse-engineer basic portfolio state from summary if possible, or leave as default.
            // Ideally, you'd have a direct GET /api/portfolio endpoint for this.
          }
        }).catch(err => console.error(err));
    }
  }, [activeTab, user.email]);

  // --- SAVE PORTFOLIO DATA ---
  const handleSyncTelemetry = async (e) => {
    e.preventDefault();
    setSyncStatus({ state: 'loading', msg: '' });
    try {
      await axios.post('http://localhost:8000/api/portfolio/sync', {
        email: user.email,
        ...portfolio
      });
      setSyncStatus({ state: 'success', msg: 'Core Telemetry Synchronized' });
      setTimeout(() => setSyncStatus({ state: 'idle', msg: '' }), 3000);
    } catch (err) {
      setSyncStatus({ state: 'error', msg: 'Handshake Failed' });
      setTimeout(() => setSyncStatus({ state: 'idle', msg: '' }), 4000);
    }
  };

  // --- CUSTOM CHART TOOLTIP ---
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0c121d]/90 border border-emerald-500/20 p-5 rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.1)] backdrop-blur-xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Year {label}</p>
          <div className="space-y-2">
            <div>
              <p className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-wider">Nominal Value</p>
              <p className="text-xl font-black text-emerald-500">
                ₹{payload[0].value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            {payload[1] && (
              <div className="pt-2 border-t border-white/5 mt-2">
                <p className="text-[9px] font-bold text-orange-500/70 uppercase tracking-wider">Inflation Adjusted (6%)</p>
                <p className="text-md font-black text-orange-400">
                  ₹{payload[1].value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 font-inter">
      
      {/* --- HEADER & NAVIGATION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/40 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em]">
            <Activity size={14} className="animate-pulse" /> Strategy Engine Online
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">
            Wealth <span className="text-emerald-500">Strategy</span>
          </h2>
        </div>
        
        {/* Module Switcher */}
        <div className="flex bg-[#0c121d] border border-white/5 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('simulator')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'simulator' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'text-slate-500 hover:text-white'
            }`}
          >
            Growth Simulator
          </button>
          <button 
            onClick={() => setActiveTab('telemetry')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'telemetry' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'text-slate-500 hover:text-white'
            }`}
          >
            Core Telemetry
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* =========================================
            TAB 1: GROWTH SIMULATOR
        ========================================= */}
        {activeTab === 'simulator' && (
          <motion.div 
            key="simulator"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* LEFT COLUMN: CONTROLS */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-card p-8 rounded-[3rem] bg-[#0c121d]/50 border border-white/5 space-y-8 shadow-2xl">
                
                {/* Input 1: Monthly Investment */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Wallet size={14} className="text-emerald-500"/> Base SIP (₹)
                    </label>
                    <span className="text-white font-black">₹{params.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <input 
                    type="range" min="500" max="100000" step="500"
                    value={params.amount}
                    onChange={(e) => setParams({...params, amount: Number(e.target.value)})}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Input 2: Expected Return Rate */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp size={14} className="text-blue-500"/> Exp. Return (%)
                    </label>
                    <span className="text-white font-black">{params.rate}%</span>
                  </div>
                  <input 
                    type="range" min="5" max="30" step="0.5"
                    value={params.rate}
                    onChange={(e) => setParams({...params, rate: Number(e.target.value)})}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Input 3: Time Horizon */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={14} className="text-orange-500"/> Time Horizon
                    </label>
                    <span className="text-white font-black">{params.years} Years</span>
                  </div>
                  <input 
                    type="range" min="1" max="40" step="1"
                    value={params.years}
                    onChange={(e) => setParams({...params, years: Number(e.target.value)})}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                {/* Input 4: Annual Step Up */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <ArrowUpRight size={14} className="text-purple-500"/> Annual Step-Up
                    </label>
                    <span className="text-white font-black">{params.step_up}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="50" step="1"
                    value={params.step_up}
                    onChange={(e) => setParams({...params, step_up: Number(e.target.value)})}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: VISUALIZATION & RESULTS */}
            <div className="lg:col-span-8 space-y-6">
              {projection ? (
                <>
                  <div className="glass-card p-10 rounded-[3rem] bg-gradient-to-br from-[#0c121d] to-[#060b13] border border-white/5 relative overflow-hidden shadow-2xl">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Sparkles size={14} className="text-emerald-500"/> Final Gross Value (Year {params.years})
                      </p>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic mb-8 drop-shadow-lg">
                      <span className="text-emerald-500 text-4xl md:text-5xl align-top mr-2 font-inter">₹</span>
                      {projection.total_value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </h1>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-800 pt-8">
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Wallet size={10}/> Invested</p>
                        <p className="text-xl font-black text-white">
                          ₹{projection.total_invested?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp size={10}/> Wealth Gained</p>
                        <p className="text-xl font-black text-emerald-400">
                          +₹{projection.estimated_returns?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Landmark size={10}/> Est. LTCG Tax</p>
                        <p className="text-xl font-black text-red-400">
                          -₹{projection.estimated_tax?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><ShieldAlert size={10}/> Post-Tax Value</p>
                        <p className="text-xl font-black text-blue-400">
                          ₹{projection.post_tax_value?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-8 rounded-[3rem] bg-[#0c121d]/50 border border-white/5 h-[400px] shadow-2xl relative overflow-hidden">
                     <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={projection.chart_data}>
                        <defs>
                          <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                        <XAxis 
                          dataKey="year" stroke="#475569" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} 
                          tickLine={false} axisLine={false} dy={10}
                        />
                        <YAxis 
                          stroke="#475569" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                          tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                          tickLine={false} axisLine={false} width={60}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" dataKey="real_value" stroke="#f97316" strokeWidth={2}
                          strokeDasharray="5 5" fillOpacity={0} 
                        />
                        <Area 
                          type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4}
                          fillOpacity={1} fill="url(#colorNominal)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center gap-6 bg-[#0c121d]/80 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                      <div className="flex items-center gap-2"><div className="w-3 h-1 bg-emerald-500 rounded-full"></div><span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Nominal</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-1 border border-dashed border-orange-500 bg-transparent rounded-full"></div><span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Inflation Adj</span></div>
                    </div>
                  </div>
                </>
              ) : (
                 <div className="w-full h-[600px] flex items-center justify-center glass-card rounded-[3rem] border border-white/5 bg-[#0c121d]">
                   <div className="flex flex-col items-center gap-4">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                     <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Calculating Trajectory...</span>
                   </div>
                 </div>
              )}
            </div>
          </motion.div>
        )}

        {/* =========================================
            TAB 2: CORE TELEMETRY SYNC
        ========================================= */}
        {activeTab === 'telemetry' && (
          <motion.div 
            key="telemetry"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto mt-8"
          >
            <div className="glass-card p-10 md:p-12 rounded-[3rem] bg-[#0c121d] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="text-center space-y-3 mb-12 relative z-10">
                <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                  <PieChart className="text-blue-500" size={32} />
                </div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Financial <span className="text-blue-500">Telemetry</span></h3>
                <p className="text-slate-500 text-xs font-medium max-w-md mx-auto leading-relaxed">
                  Inject your current financial parameters. This data powers your Dashboard Analytics, Health Score, and AI Advisor Context.
                </p>
              </div>

              <form onSubmit={handleSyncTelemetry} className="space-y-8 relative z-10">
                
                {syncStatus.state === 'success' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[10px] font-black uppercase">
                    <CheckCircle2 size={16} /> {syncStatus.msg}
                  </motion.div>
                )}
                {syncStatus.state === 'error' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase">
                    <AlertCircle size={16} /> {syncStatus.msg}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 flex items-center gap-2 group-focus-within:text-emerald-500 transition-colors">
                      <TrendingUp size={12}/> Monthly Income (₹)
                    </label>
                    <input 
                      type="number" required
                      value={portfolio.income || ''}
                      onChange={(e) => setPortfolio({...portfolio, income: Number(e.target.value)})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                      placeholder="e.g. 100000"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 flex items-center gap-2 group-focus-within:text-red-500 transition-colors">
                      <Activity size={12}/> Monthly Expenses (₹)
                    </label>
                    <input 
                      type="number" required
                      value={portfolio.expenses || ''}
                      onChange={(e) => setPortfolio({...portfolio, expenses: Number(e.target.value)})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-red-500/50 transition-all shadow-inner"
                      placeholder="e.g. 40000"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 flex items-center gap-2 group-focus-within:text-blue-500 transition-colors">
                      <ShieldAlert size={12}/> Total Cash/Savings (₹)
                    </label>
                    <input 
                      type="number" required
                      value={portfolio.savings || ''}
                      onChange={(e) => setPortfolio({...portfolio, savings: Number(e.target.value)})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
                      placeholder="Emergency funds"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 flex items-center gap-2 group-focus-within:text-purple-500 transition-colors">
                      <Wallet size={12}/> Total Investments (₹)
                    </label>
                    <input 
                      type="number" required
                      value={portfolio.investments || ''}
                      onChange={(e) => setPortfolio({...portfolio, investments: Number(e.target.value)})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-purple-500/50 transition-all shadow-inner"
                      placeholder="Stocks, Mutual Funds..."
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                    disabled={syncStatus.state === 'loading'}
                    type="submit" 
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-3 border border-white/10"
                  >
                    {syncStatus.state === 'loading' ? (
                      <RefreshCw className="animate-spin" size={18} />
                    ) : (
                      <>Sync Database <Save size={16} /></>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}