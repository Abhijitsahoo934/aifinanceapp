import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Wallet, Calendar, Tag, Loader2, AlertCircle } from 'lucide-react';

export default function NewGoalModal({ isOpen, onClose, onCreated, userEmail }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    current_amount: '',
    category: 'Savings',
    deadline: ''
  });

  const categories = ['Savings', 'Investment', 'Side Hustle', 'Debt Payoff', 'Milestone'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Build the base payload WITHOUT the deadline
      const payload = {
        title: formData.title,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount) || 0,
        category: formData.category,
        user_email: userEmail
      };

      // 2. Only attach the deadline if the user actually picked a date
      if (formData.deadline) {
        payload.deadline = formData.deadline;
      }

      // 3. Send to FastAPI
      await axios.post('/api/goals', payload);
      
      // Reset form and trigger refresh
      setFormData({ title: '', target_amount: '', current_amount: '', category: 'Savings', deadline: '' });
      onCreated(); 
      onClose();
    } catch (err) {
      console.error("Objective Creation Failed:", err.response?.data || err.message);
      
      // Capture the exact FastAPI error and show it in the UI
      const backendError = err.response?.data?.detail;
      setError(
        Array.isArray(backendError) 
          ? `Data Error: ${backendError[0].loc[1]} ${backendError[0].msg}` 
          : "System failure: Unable to establish objective."
      );
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        
        {/* Backdrop Blur Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#060b13]/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md glass-card rounded-[2.5rem] bg-[#0c121d] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                  New <span className="text-emerald-500">Objective</span>
                </h3>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Initialize Target Parameters</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Target size={12} className="text-emerald-500"/> Objective Designation
                </label>
                <input 
                  type="text" required
                  placeholder="e.g., Emergency Fund, App Launch..."
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#060b13] border border-white/5 rounded-2xl py-3.5 px-4 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Target Amount */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Wallet size={12} className="text-emerald-500"/> Target (₹)
                  </label>
                  <input 
                    type="number" required min="1"
                    placeholder="100000"
                    value={formData.target_amount}
                    onChange={e => setFormData({...formData, target_amount: e.target.value})}
                    className="w-full bg-[#060b13] border border-white/5 rounded-2xl py-3.5 px-4 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                {/* Initial Capital */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Wallet size={12} className="text-slate-500"/> Initial Capital (₹)
                  </label>
                  <input 
                    type="number" min="0"
                    placeholder="0"
                    value={formData.current_amount}
                    onChange={e => setFormData({...formData, current_amount: e.target.value})}
                    className="w-full bg-[#060b13] border border-white/5 rounded-2xl py-3.5 px-4 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Tag size={12} className="text-emerald-500"/> Category
                  </label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-[#060b13] border border-white/5 rounded-2xl py-3.5 px-4 text-xs font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {/* Deadline */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} className="text-emerald-500"/> Deadline (Opt)
                  </label>
                  <input 
                    type="date"
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="w-full bg-[#060b13] border border-white/5 rounded-2xl py-3.5 px-4 text-xs font-bold text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Establish Node"}
                </button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}