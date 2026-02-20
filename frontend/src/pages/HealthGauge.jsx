import React from 'react';
import GaugeComponent from 'react-gauge-component';
import { motion } from 'framer-motion';

const HealthGauge = ({ score = 0 }) => {
  // Ensure score is a valid number between 0-100
  const validScore = Math.min(Math.max(Number(score), 0), 100);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 rounded-[3rem] bg-[#0c121d]/50 border border-white/5 flex flex-col items-center shadow-2xl relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/10 blur-[50px] pointer-events-none" />

      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">
        Financial Health Index
      </h3>
      
      <div className="w-full max-w-[280px]">
        <GaugeComponent
          value={validScore}
          type="radial"
          labels={{
            tickLabels: {
              type: "inner",
              ticks: [
                { value: 20 }, { value: 40 }, { value: 60 }, { value: 80 }, { value: 100 }
              ],
              style: { fontSize: "10px", fill: "#64748b", fontWeight: "bold" }
            },
            valueLabel: {
              style: { fontSize: "40px", fill: "#fff", fontWeight: "900", fontFamily: "Inter" },
              formatTextValue: (value) => value
            }
          }}
          arc={{
            colorArray: ['#ef4444', '#f59e0b', '#10b981'], 
            subArcs: [{limit: 40}, {limit: 70}, {limit: 100}],
            padding: 0.05,
            width: 0.25
          }}
          pointer={{
            type: "needle",
            color: "#3b82f6", 
            length: 0.75,
            width: 12,
            elastic: true
          }}
        />
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        <p className={`text-[11px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border ${
          validScore > 80 ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 
          validScore > 50 ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 
          'text-red-500 border-red-500/20 bg-red-500/5'
        }`}>
          Status: {validScore > 80 ? 'Excellent' : validScore > 50 ? 'Stable' : 'Critical Risk'}
        </p>
      </div>
    </motion.div>
  );
};

export default HealthGauge;