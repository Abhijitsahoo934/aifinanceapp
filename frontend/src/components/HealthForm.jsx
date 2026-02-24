import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Wallet, ArrowUpRight, Loader2, Zap, AlertCircle } from 'lucide-react';
import HealthGauge from '../pages/HealthGauge'; 

export default function HealthForm({ userEmail: propEmail, onComplete }) {
  const [data, setData] = useState({ income: '', expenses: '', savings: '', investments: '' });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // AUTH PROTECT: Ensure we have an identity even if props fail
  const getActiveEmail = () => {
    if (propEmail) return propEmail;
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return savedUser.email || null;
  };

  const runDiagnostic = async () => {
    const email = getActiveEmail();
    setError(null);

    if (!email) {
      setError("Authority Identity not found. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      // 1. Sync data to Backend (Fixed: Removed 127.0.0.1 and fixed .trim())
      await axios.post('/api/portfolio/sync', {
        email: email.toLowerCase().trim(),
        income: parseFloat(data.income) || 0,
        expenses: parseFloat(data.expenses) || 0,
        savings: parseFloat(data.savings) || 0,
        investments: parseFloat(data.investments) || 0
      });

      // 2. Fetch Comprehensive Intelligence (Fixed: Removed 127.0.0.1)
      const res = await axios.get(`/api/analytics/comprehensive?email=${email}`);
      
      // 3. Update Visual State
      setStats(res.data);

      // 4. Trigger Parent Refresh
      if (onComplete) onComplete();

    } catch (err) {
      console.error("Diagnostic Engine Failure:", err);
      setError("Backend connection failed. Please ensure your server is running.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (s) => {
    if (s > 80) return 'text-emerald-500';
    if (s > 50) return 'text-blue-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-8">
      {/* Input Console */}
      <div className="glass-card p-4 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group bg-[#0c121d]/50 shadow-2xl">
        <div className="space-y-6">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold">
              <AlertCircle size={14} /> {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Monthly Income', key: 'income', icon: Wallet },
              { label: 'Monthly Expenses', key: 'expenses', icon: ArrowUpRight },
              { label: 'Total Liquidity', key: 'savings', icon: ShieldCheck },
              { label: 'Investments', key: 'investments', icon: Zap },
            ].map((item) => (
              <div key={item.key} className="relative group/input">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4 mb-2 block">
                  {item.label}
                </label>
                <div className="relative">
                  <item.icon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-emerald-500 transition-colors" size={18} />
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={data[item.key]}
                    className="w-full bg-[#060b13] border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-800"
                    onChange={e => setData({...data, [item.key]: e.target.value})} 
                  />
                </div>
              </div>
            ))}
          </div>

          <motion.button 
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={runDiagnostic} 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/10 transition-all flex items-center justify-center gap-3 border border-white/10"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <><Activity size={18} /> Execute Diagnostic</>
            )}
          </motion.button>
        </div>
      </div>

      {/* Results Engine */}
      <AnimatePresence>
        {stats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10"
          >
            {/* Health Gauge Visualization */}
            <div className="glass-card p-4 rounded-[3rem] border border-white/5 bg-[#0c121d]/50">
               <HealthGauge score={stats.summary.health_score} />
            </div>

            {/* Intelligence Panel */}
            <div className="glass-card p-8 rounded-[3rem] border border-white/5 bg-[#0c121d]/50 flex flex-col justify-center space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Activity size={120} />
              </div>

              <div className="flex justify-between items-start border-b border-white/5 pb-6">
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Stability Index</p>
                  <p className={`text-3xl font-black uppercase italic tracking-tighter ${getScoreColor(stats.summary.health_score)}`}>
                    {stats.insights}
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500">
                  <Zap size={20} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1 text-center p-4 bg-[#060b13] rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Net Worth</p>
                  <p className="text-lg font-bold text-white">₹{stats.summary.net_worth.toLocaleString('en-IN')}</p>
                </div>
                <div className="space-y-1 text-center p-4 bg-[#060b13] rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Survival</p>
                  <p className="text-lg font-bold text-white">{stats.summary.emergency_fund_months} Months</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                 <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Monthly Surplus</p>
                   <p className="text-emerald-500 font-black text-lg">₹{stats.summary.monthly_surplus.toLocaleString('en-IN')}</p>
                 </div>
                 <ArrowUpRight className="text-slate-700" size={24} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}