import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, PieChart, Coins } from 'lucide-react';

export default function SipCalculator() {
  const [data, setData] = useState({ amount: 5000, rate: 12, years: 10 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/calculate-sip`, {
        params: data
      });
      setResult(res.data);
    } catch (err) {
      console.error("Calculation Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 rounded-[2.5rem] border border-slate-800/60">
      <div className="flex justify-between items-start mb-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
            <TrendingUp size={24} />
          </div>
          <h2 className="text-2xl font-black text-white italic tracking-tight">Growth Simulator</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {['amount', 'rate', 'years'].map((key) => (
          <div key={key} className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
              {key === 'amount' ? 'Monthly ₹' : key === 'rate' ? 'Return %' : 'Years'}
            </label>
            <input 
              type="number" 
              value={data[key]}
              onChange={e => setData({...data, [key]: e.target.value})} 
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white font-bold text-sm focus:border-blue-500/50 outline-none transition-all" 
            />
          </div>
        ))}
      </div>

      <button 
        onClick={calculate} 
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 mb-10"
      >
        {loading ? "Simulating..." : "Calculate Wealth Growth"}
      </button>

      {result && (
        <div className="space-y-10 animate-in fade-in duration-700">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.chart_data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="year" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                <Area type="monotone" dataKey="invested" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-800">
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Invested</p>
              <p className="text-xl font-black text-white">₹{result.total_invested.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Gains</p>
              <p className="text-xl font-black text-emerald-400">₹{result.estimated_returns.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}