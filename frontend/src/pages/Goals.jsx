import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Plus, Rocket, Laptop, ArrowUpRight, 
  MoreHorizontal, Sparkles, TrendingUp, Loader2, Trash2
} from 'lucide-react';
import InjectionModal from '../components/InjectionModal';
import NewGoalModal from '../components/NewGoalModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.12, delayChildren: 0.2 } 
  }
};

const cardVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', damping: 20, stiffness: 100 } 
  }
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchGoals = useCallback(async () => {
    if (!user.email) return;
    try {
      const res = await axios.get(`http://localhost:8000/api/goals`, {
        params: { email: user.email.toLowerCase() }
      });
      setGoals(res.data);
    } catch (err) { 
      console.error("Authority Goal Sync Error:", err); 
    } finally {
      setLoading(false);
    }
  }, [user.email]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleInjectClick = (goal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Terminate this objective node permanently?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/goals/${goalId}`, {
        params: { email: user.email.toLowerCase() }
      });
      fetchGoals();
    } catch (err) {
      alert("Termination failed. System integrity check required.");
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-12 pb-24 px-4"
    >
      {/* --- Mission Control Header --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em]">
            <Target size={14} className="animate-pulse" /> Objective Architecture
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-tight">
            Mission <span className="text-emerald-500">Milestones</span>
          </h2>
          <p className="text-slate-500 font-bold text-sm max-w-lg leading-relaxed">
            Synchronizing liquidity with venture objectives. Track every Rupee toward your next launch.
          </p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl shadow-emerald-600/20 border border-white/10"
        >
          <Plus size={18} strokeWidth={3} /> Establish New Goal
        </motion.button>
      </div>

      {/* --- Objectives Display --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {loading ? (
           <div className="col-span-full flex justify-center py-20">
             <Loader2 className="animate-spin text-emerald-500" size={48} />
           </div>
        ) : (
          <AnimatePresence mode='popLayout'>
            {goals.length > 0 ? goals.map((goal) => {
              const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
              const isCompleted = progress >= 100;

              return (
                <motion.div
                  key={goal.id}
                  variants={cardVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className={`relative group glass-card p-10 rounded-[3rem] border border-white/5 bg-[#0c121d]/40 transition-all duration-500 ${
                    isCompleted ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.05)]' : ''
                  }`}
                >
                  <div className="relative z-10 space-y-10">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-[1.5rem] border ${
                          isCompleted ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-[#060b13] border-white/5 text-slate-500 group-hover:text-emerald-500 transition-colors'
                        }`}>
                          {goal.category === 'Side Hustle' ? <Rocket size={26} /> : <Laptop size={26} />}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">{goal.title}</h3>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mt-1">{goal.category} Priority Node</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 text-slate-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-end px-2">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Accumulated</p>
                          <p className="text-3xl font-black text-white italic tracking-tighter">₹{goal.current_amount.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Target Path</p>
                          <p className="text-sm font-bold text-slate-500">₹{goal.target_amount.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative pt-2">
                        <div className="w-full h-4 bg-[#060b13] rounded-full overflow-hidden p-[3px] border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className={`h-full rounded-full relative ${isCompleted ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-emerald-600 to-blue-600'}`}
                          />
                        </div>
                        {isCompleted && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-3 -top-3 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border border-white/20">
                            <Sparkles size={16} fill="currentColor" />
                          </motion.div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center px-2">
                         <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCompleted ? 'text-emerald-500' : 'text-slate-500'}`}>
                           {isCompleted ? "Protocol Complete" : `Optimization: ${Math.round(progress)}%`}
                         </span>
                         <button 
                           onClick={() => handleInjectClick(goal)}
                           className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-500/10 px-4 py-2 rounded-xl transition-all"
                         >
                           Inject Capital <ArrowUpRight size={14} />
                         </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="col-span-full py-20 text-center glass-card rounded-[3rem] border border-white/5 opacity-50">
                <p className="text-slate-500 font-black uppercase tracking-widest">No Active Objectives Found</p>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      <InjectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} goal={selectedGoal} onUpdate={fetchGoals} />
      <NewGoalModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreated={fetchGoals} userEmail={user.email} />
    </motion.div>
  );
}