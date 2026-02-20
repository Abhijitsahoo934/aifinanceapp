import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Bot, Sparkles, 
  User, ShieldCheck, Terminal, Cpu, Zap 
} from 'lucide-react';

export default function AIAdvisor() {
  const [query, setQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  
  // --- AUTHENTICATION CONTEXT ---
  // Retrieves the user object stored during login/registration
  const authUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = authUser.email || "guest@financepro.ai";

  // Intelligent Auto-scroll Logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatResponse, loading]);

  const handleChat = async () => {
    if (!query || loading) return;
    const currentQuery = query;
    setQuery('');
    setLoading(true);
    setChatResponse(''); 
    
    try {
      // --- CRITICAL FIX: Identity Injection ---
      // We now pass the email along with the query so the backend can verify the 'Identity'
      const res = await axios.post('http://127.0.0.1:8000/api/ai/chat', {
        query: currentQuery,
        email: userEmail 
      });
      
      setChatResponse(res.data.response);
    } catch (err) { 
      setChatResponse("⚠️ [SYSTEM ERROR]: Local Intelligence Link severed. Verify Ollama (Llama 3.2) status and Database Auth."); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-[calc(100vh-160px)] flex flex-col max-w-6xl mx-auto"
    >
      {/* --- Authority Intelligence Header --- */}
      <div className="flex items-center justify-between border-b border-slate-800/40 pb-8 mb-8">
        <div className="flex items-center gap-5">
          <div className="relative">
            <motion.div 
              animate={loading ? { scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"
            />
            <div className="relative p-4 bg-[#0c121d] border border-blue-500/30 rounded-[1.5rem] shadow-2xl">
              <Cpu className="text-blue-400" size={32} />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              AI <span className="text-blue-500">Consultant</span>
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-md">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
              </div>
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                Neural Architecture: Llama 3.2 8B
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-end gap-2">
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-2xl border border-white/5">
             <ShieldCheck size={14} className="text-emerald-500" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID: {userEmail.split('@')[0]}</span>
           </div>
           <p className="text-[9px] font-bold text-slate-600 uppercase italic">Localhost Protocol v2.4</p>
        </div>
      </div>

      {/* --- Centralized Analysis Feed --- */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 space-y-10 custom-scrollbar mb-8 pr-6"
      >
        <AnimatePresence mode="wait">
          {!chatResponse && !loading ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="p-10 bg-slate-900/20 rounded-[3rem] border border-dashed border-slate-800">
                <Terminal size={64} className="text-slate-800" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-slate-400 italic uppercase">Awaiting Strategy Command...</h3>
                <p className="text-slate-600 max-w-sm mx-auto text-xs font-bold uppercase tracking-widest leading-loose">
                  Analyze tax slabs, optimize SIPs, or audit side-hustle burn rates.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {chatResponse && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-6 items-start"
                >
                  <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-2 shadow-lg shadow-blue-500/5">
                    <Sparkles size={20} className="text-blue-400" />
                  </div>
                  <div className="glass-card p-8 rounded-[2.5rem] rounded-tl-none border border-white/5 relative bg-[#0c121d]/50 backdrop-blur-2xl">
                    <div className="text-slate-300 text-base leading-[1.8] font-medium whitespace-pre-wrap">
                       {chatResponse}
                    </div>
                  </div>
                </motion.div>
              )}

              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-6 items-center"
                >
                  <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center animate-spin">
                    <Zap size={20} className="text-blue-400" />
                  </div>
                  <div className="bg-slate-900/50 px-6 py-4 rounded-2xl flex gap-3 items-center border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Querying Neural Core</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* --- High-Response Command Input --- */}
      <motion.div 
        layout
        className="relative group bg-[#0c121d] p-3 rounded-3xl border border-white/5 focus-within:border-blue-500/40 transition-all shadow-3xl"
      >
        <div className="flex items-center gap-4">
          <div className="pl-5 text-slate-700">
            <User size={22} />
          </div>
          <input 
            className="flex-1 bg-transparent py-5 text-white placeholder-slate-700 outline-none text-base font-bold tracking-tight"
            placeholder="Initialize financial audit query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChat()}
          />
          <motion.button 
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleChat}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 px-8 py-5 rounded-2xl text-white shadow-2xl shadow-blue-600/20 flex items-center gap-3 transition-all border border-white/10"
          >
            <Send size={18} className={loading ? "animate-pulse" : ""} />
            <span className="font-black text-[11px] uppercase tracking-widest">Execute Strategy</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}