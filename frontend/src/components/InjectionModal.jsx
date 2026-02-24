import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ArrowUpRight, Loader2 } from 'lucide-react';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: 'spring', damping: 25, stiffness: 300 } 
  }
};

export default function InjectionModal({ isOpen, onClose, goal, onUpdate }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInjection = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    setLoading(true);
    try {
      // MATCHED TO BACKEND: POST request with query parameters
      await axios.post(`/api/goals/inject`, null, {
        params: {
          goal_id: goal.id,
          amount: parseFloat(amount)
        }
      });
      
      onUpdate(); // Refresh the goals list in Goals.jsx
      setAmount('');
      onClose();
    } catch (err) {
      console.error("Capital Injection Failed:", err);
      alert("Protocol Failure: Could not synchronize liquidity injection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="absolute inset-0 bg-[#060b13]/85 backdrop-blur-xl"
          />
          
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative w-full max-w-lg glass-card p-10 rounded-[3rem] border border-white/10 bg-[#0c121d] shadow-[0_0_100px_rgba(0,0,0,0.5)]"
          >
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all hover:rotate-90"
            >
              <X size={24} />
            </button>

            <div className="space-y-8">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <Zap className="text-emerald-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight">
                    Capital <span className="text-emerald-500">Injection</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                    System Node: <span className="text-slate-300">{goal?.title}</span>
                  </p>
                </div>
              </div>

              {/* Injection Form */}
              <form onSubmit={handleInjection} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">
                    Liquidity Amount (₹)
                  </label>
                  <div className="relative group">
                    <ArrowUpRight 
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 group-focus-within:animate-bounce" 
                      size={20} 
                    />
                    <input 
                      autoFocus
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#060b13] border border-white/5 p-6 pl-14 rounded-3xl text-white font-black text-2xl focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-slate-800"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 border border-white/10"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>Authorize Transfer <ArrowUpRight size={18} /></>
                  )}
                </motion.button>
              </form>
            </div>

            {/* Visual Progress Context */}
            {goal && (
               <div className="mt-8 pt-8 border-t border-white/5 text-center">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                    Current accumulation: ₹{goal.current_amount.toLocaleString('en-IN')}
                  </p>
               </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}