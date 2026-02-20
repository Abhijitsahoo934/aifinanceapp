import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

const WealthChart = ({ data = [] }) => {
  return (
    <div className="glass-card p-8 rounded-[3rem] bg-[#0c121d]/50 border border-white/5 h-[450px] shadow-2xl">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
            Wealth Trajectory
          </h3>
          <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">10-Year compounding model</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">12% CAGR</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
          <XAxis 
            dataKey="year" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}}
            tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '12px' }}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            cursor={{ stroke: '#334155', strokeWidth: 2 }}
            formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, "Portfolio"]}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#chartGradient)" 
          />
          <Area 
            type="monotone" 
            dataKey="real_value" 
            stroke="#64748b" 
            strokeWidth={2}
            strokeDasharray="6 6"
            fill="transparent" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WealthChart;