import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShieldCheck, HeartPulse, TrendingUp, Target, AlertTriangle, Loader2 } from 'lucide-react';

export default function WealthSummaryCard({ userEmail }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!userEmail) return;
    try {
      const res = await axios.get(`/api/analytics/comprehensive`, {
        params: { email: userEmail }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Analytics Sync Failure:", err);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="w-full glass-card h-64 flex items-center justify-center rounded-[3rem] border border-white/5 bg-[#0c121d]/40">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  // Handle case where user has no portfolio setup yet
  if (!stats || stats.status === "No Authority Record Found") {
    return (
      <div className="w-full glass-card p-10 flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-emerald-500/30 bg-emerald-500/5 text-center">
        <AlertTriangle className="text-emerald-500 mb-4" size={40} />
        <h3 className="text-white font-black text-xl mb-2">Portfolio Awaiting Initialization</h3>
        <p className="text-slate-400 text-xs">Sync your income and expenses to unlock the Financial Vitality Audit.</p>
      </div>
    );
  }

  // Destructure for cleaner JSX
  const { summary, goals, projections, insights } = stats;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full glass-card p-8 md:p-10 rounded-[3rem] border border-white/10 bg-gradient-to-br from-[#0c121d] to-[#060b13] shadow-2xl relative overflow-hidden"
    >
      {/* Ambient Glow tied to Health Score */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[80px] rounded-full pointer-events-none transition-colors duration-1000 ${
        insights === 'EXCELLENT' ? 'bg-emerald-500/15' : insights === 'STABLE' ? 'bg-blue-500/15' : 'bg-red-500/15'
      }`} />

      {/* --- TOP ROW: Net Worth & Health Score --- */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:items-end mb-10 pb-8 border-b border-white/5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Global Net Worth</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter italic">
            <span className="text-emerald-500 text-4xl align-top mr-1">₹</span>
            {summary.net_worth.toLocaleString('en-IN')}
          </h1>
        </div>

        {/* Vitality Score Badge */}
        <div className="flex items-center gap-4 bg-[#060b13] border border-white/5 px-6 py-4 rounded-[2rem]">
          <HeartPulse className={insights === 'EXCELLENT' ? 'text-emerald-500' : 'text-orange-500'} size={24} />
          <div>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Vitality Index</p>
            <p className="text-2xl font-black text-white">{summary.health_score}<span className="text-sm text-slate-500">/100</span></p>
          </div>
          <div className={`ml-4 px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${
            insights === 'EXCELLENT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
            insights === 'STABLE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
            'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {insights}
          </div>
        </div>
      </div>

      {/* --- MIDDLE ROW: Metrics Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Metric 1: Surplus */}
        <div className="p-6 rounded-[2rem] bg-[#060b13]/50 border border-white/5">
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Monthly Surplus</p>
          <p className={`text-2xl font-black ${summary.monthly_surplus >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            ₹{summary.monthly_surplus.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Metric 2: Runway */}
        <div className="p-6 rounded-[2rem] bg-[#060b13]/50 border border-white/5">
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Emergency Runway</p>
          <p className="text-2xl font-black text-white">
            {summary.emergency_fund_months} <span className="text-sm text-slate-500">Months</span>
          </p>
        </div>

        {/* Metric 3: SIP Projection */}
        <div className="p-6 rounded-[2rem] bg-[#060b13]/50 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
            <TrendingUp size={12} className="text-emerald-500" /> 10-Year Trajectory
          </p>
          <p className="text-2xl font-black text-white">
            ₹{(projections.ten_year_total / 100000).toFixed(2)}<span className="text-sm text-slate-500">L</span>
          </p>
        </div>
      </div>

      {/* --- BOTTOM ROW: Objective Matrix --- */}
      <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
        <div className="flex justify-between items-end mb-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Target size={14} className="text-orange-500"/> Objective Completion Matrix ({goals.count} Active)
          </p>
          <p className="text-orange-500 font-black text-sm">{goals.completion_percentage}%</p>
        </div>
        <div className="w-full h-2 bg-[#060b13] rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${goals.completion_percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400"
          />
        </div>
        <p className="text-right text-[9px] font-bold text-slate-600 mt-2 uppercase tracking-widest">
          Shortfall: ₹{goals.shortfall.toLocaleString('en-IN')}
        </p>
      </div>

    </motion.div>
  );
}