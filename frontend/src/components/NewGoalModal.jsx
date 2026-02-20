import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Rocket, Landmark, Loader2, Sparkles, TrendingUp } from 'lucide-react';

const categories = [
  { id: 'Side Hustle', icon: Rocket, color: 'text-orange-500' },
  { id: 'Investment', icon: TrendingUp, color: 'text-blue-500' },
  { id: 'Savings', icon: Landmark, color: 'text-emerald-500' }
];

export default function NewGoalModal({ isOpen, onClose, onCreated, userEmail }) {
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    category: 'Side Hustle'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Safety Check: Identity Presence
    if (!userEmail) {
      alert("Identity Error: Session expired or invalid. Please log in again.");
      return;
    }

    // 2. Safety Check: Form Data
    if (!formData.title || !formData.target_amount) {
        alert("Input Error: Please fill in all required fields.");
        return;
    }

    setLoading(true);

    try {
      // 3. Payload Construction (JavaScript logic, not Python)
      const payload = {
        email: userEmail.trim().toLowerCase(), // FIX: .strip() removed, .trim() used
        title: formData.title.trim(),
        target_amount: parseFloat(formData.target_amount), // Ensure float
        category: formData.category,
        current_amount: 0.0
      };

      // 4. Transmission
      await axios.post('http://localhost:8000/api/goals/create', payload);
      
      // 5. Success Protocol
      onCreated(); // Refresh parent
      setFormData({ title: '', target_amount: '', category: 'Side Hustle' }); // Reset
      onClose();
      
    } catch (err) {
      console.error("Establishment Error:", err);
      
      const serverMessage = err.response?.data?.detail;
      const status = err.response?.status;

      if (status === 404) {
         alert("Protocol Failure (404): Identity node not found in database. Please register/login again.");
      } else if (status === 422) {
         alert("Data Mismatch (422): Ensure target amount is a valid number.");
      } else {
         alert(`System Error: ${serverMessage || "Backend connection failed."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#060b13]/90 backdrop-blur-xl"
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, y: 30, opacity: 0 }} 
            animate={{ scale: 1, y: 0, opacity: 1 }} 
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            className="relative w-full max-w-xl bg-[#0c121d] border border-white/10 p-10 md:p-12 rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          >
            <button 
              onClick={onClose} 
              className="absolute top-10 right-10 text-slate-500 hover:text-white transition-all hover:rotate-90"
            >
              <X size={24} />
            </button>
            
            <div className="mb-10 space-y-2">
              <div className="flex items-center gap-3 text-emerald-500 mb-2">
                <Target size={20} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Establishment Protocol</span>
              </div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                New <span className="text-emerald-500">Milestone</span>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Objective Title */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">Target Name</label>
                <input 
                  required
                  autoFocus
                  className="w-full bg-[#060b13] border border-white/5 rounded-3xl py-6 px-8 text-white font-bold text-lg outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-800 shadow-inner"
                  placeholder="e.g. Startup Seed Capital"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              {/* Target Amount */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">Target Liquidity (₹)</label>
                <div className="relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-xl">₹</div>
                   <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full bg-[#060b13] border border-white/5 rounded-3xl py-6 px-14 text-white font-black text-2xl outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-800 shadow-inner"
                    placeholder="5,00,000"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">Objective Tier</label>
                <div className="grid grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({...formData, category: cat.id})}
                      className={`group flex flex-col items-center gap-3 p-5 rounded-[2rem] border transition-all duration-300 ${
                        formData.category === cat.id 
                        ? 'bg-emerald-600/10 border-emerald-500/50 text-white shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                        : 'bg-[#060b13] border-white/5 text-slate-600 hover:border-white/20'
                      }`}
                    >
                      <cat.icon size={20} className={formData.category === cat.id ? 'text-emerald-400' : 'text-slate-700 group-hover:text-slate-400'} />
                      <span className="text-[9px] font-black uppercase tracking-tighter">{cat.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 py-7 rounded-[2rem] text-white font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Sparkles size={18} />
                    Initialize Protocol
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}