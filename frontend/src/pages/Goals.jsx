import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Plus, Trash2, TrendingUp, Calendar, 
  ChevronRight, Sparkles, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ 
    title: '', target_amount: '', current_amount: 0, category: 'Savings' 
  });
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchGoals = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/goals', { 
        params: { email: user.email } 
      });
      setGoals(res.data);
    } catch (err) {
      console.error("Failed to fetch objective nodes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/goals', {
        ...newGoal,
        user_email: user.email,
        target_amount: parseFloat(newGoal.target_amount)
      });
      setShowModal(false);
      fetchGoals();
    } catch (err) {
      alert("Handshake Failure: Ensure all fields are valid.");
    }
  };

  const deleteGoal = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/goals/${id}`, { 
        params: { email: user.email } 
      });
      fetchGoals();
    } catch (err) {
      console.error("Termination Failure:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 font-inter">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/40 pb-10">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Objective <span className="text-emerald-500">Matrix</span>
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">
            Strategic target tracking & capital allocation
          </p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all"
        >
          <Plus size={18} /> Establish New Node
        </motion.button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 text-emerald-500">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-[10px] font-black uppercase tracking-widest">Scanning objective nodes...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {goals.map((goal) => {
              const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
              return (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card p-8 rounded-[2.5rem] bg-[#0c121d]/50 border border-white/5 relative group overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        {goal.category}
                      </span>
                      <h4 className="text-xl font-black text-white italic mt-2">{goal.title}</h4>
                    </div>
                    <button 
                      onClick={() => deleteGoal(goal.id)}
                      className="text-slate-700 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-2xl font-black text-white italic">
                        ₹{goal.current_amount.toLocaleString()} 
                        <span className="text-xs text-slate-600 ml-2 not-italic font-bold">/ ₹{goal.target_amount.toLocaleString()}</span>
                      </p>
                      <span className="text-sm font-black text-emerald-500">{progress.toFixed(0)}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-400"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create Goal Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-lg glass-card p-10 rounded-[3rem] bg-[#0c121d] border border-white/10 shadow-3xl"
            >
              <h3 className="text-2xl font-black text-white uppercase italic mb-8 flex items-center gap-3">
                <Target className="text-emerald-500" /> New Objective Node
              </h3>
              
              <form onSubmit={handleAddGoal} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Objective Title</label>
                  <input 
                    type="text" required
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                    placeholder="e.g., Retirement Vault"
                    onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Target Amount (₹)</label>
                    <input 
                      type="number" required
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      placeholder="500000"
                      onChange={e => setNewGoal({...newGoal, target_amount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Classification</label>
                    <select 
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none cursor-pointer focus:border-emerald-500/50 transition-all"
                      onChange={e => setNewGoal({...newGoal, category: e.target.value})}
                    >
                      <option>Savings</option>
                      <option>Investment</option>
                      <option>Real Estate</option>
                      <option>Emergency</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    Establish Node
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}