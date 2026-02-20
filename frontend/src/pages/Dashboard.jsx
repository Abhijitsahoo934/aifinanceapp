import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import { motion } from 'framer-motion';
import { 
  Activity, 
  Wallet, 
  ArrowUpRight, 
  Sparkles, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import HealthForm from '../components/HealthForm';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120 } }
};

export default function Dashboard() {
  const [market, setMarket] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate(); // Hook initialized
  
  // Normalized key 'user' from your login system
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const fetchMarket = useCallback(async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/market-status');
      setMarket(res.data);
    } catch (err) { 
      console.error("Market Intelligence Offline", err); 
    }
  }, []);

  useEffect(() => {
    fetchMarket();
  }, [fetchMarket]);

  const handleDiagnosticComplete = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchMarket(); 
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-10 pb-20"
    >
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em]">
            <Sparkles size={14} /> Intelligence Node Active
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              {user.email ? user.email.split('@')[0] : 'Authority'}
            </span>
          </h2>
          <p className="text-slate-500 font-bold text-sm tracking-wide">
            Your decentralized financial data is synchronized with the Authority Engine.
          </p>
        </div>
        
        <div className="flex items-center gap-3 px-5 py-2.5 bg-[#0c121d] rounded-2xl border border-white/5 backdrop-blur-xl shadow-2xl">
          <Clock size={16} className="text-emerald-500" />
          <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          variants={item}
          whileHover={{ y: -5 }}
          className="group relative overflow-hidden glass-card p-8 rounded-[3rem] bg-[#0c121d]/50 border border-white/5"
        >
          <div className={`absolute -right-10 -top-10 w-32 h-32 blur-[80px] opacity-20 transition-colors duration-1000 ${market?.is_bullish ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <Activity className="text-emerald-500" size={24} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Index</span>
                <p className="text-xs font-bold text-white uppercase tracking-tighter">Nifty 50</p>
              </div>
            </div>
            <div>
              {market ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-5xl font-black text-white tracking-tighter">₹{market.price}</p>
                    <p className={`text-xs font-black mt-2 ${market.is_bullish ? 'text-emerald-400' : 'text-red-400'}`}>
                      {market.change_pct} {market.is_bullish ? '▲' : '▼'}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <div className={`h-1.5 w-1.5 rounded-full ${market.is_bullish ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{market.status}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-2"><div className="h-12 w-40 bg-white/5 animate-pulse rounded-2xl" /></div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2 glass-card p-10 rounded-[3rem] bg-[#0c121d]/50 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                <Wallet className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="font-black text-2xl text-white uppercase italic tracking-tight">Health <span className="text-blue-500">Scanner</span></h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Financial Vitality Audit v4.0</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <HealthForm 
              userEmail={user.email} 
              onComplete={handleDiagnosticComplete} 
              key={refreshTrigger} 
            />
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="p-8 bg-gradient-to-r from-[#0c121d] to-[#060b13] rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping absolute" />
            <div className="h-3 w-3 rounded-full bg-emerald-500 relative" />
          </div>
          <p className="text-sm text-slate-400 font-bold leading-relaxed">
            <span className="text-white uppercase font-black text-xs mr-2 tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">AI Insight</span>
            Based on your {user.role || 'Authority'} profile, a 10% increase in SIP allocation today could hit your wealth target 6 months earlier.
          </p>
        </div>
        <button 
          onClick={() => navigate('/planner')} 
          className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all hover:tracking-[0.3em]"
        >
          Execute Optimization
        </button>
      </motion.div>
    </motion.div>
  );
}