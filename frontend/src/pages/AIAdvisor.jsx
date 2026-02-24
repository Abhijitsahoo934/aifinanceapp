import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Bot, Sparkles, 
  User, ShieldCheck, Terminal, Cpu, Zap 
} from 'lucide-react';

export default function AIAdvisor() {
  const [query, setQuery] = useState('');
  // 📍 CRITICAL FIX: Replaced single string with an array to hold the full conversation
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'System Online. I am your Llama 3.2 neural advisor. How can we optimize your wealth strategy today?' 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  
  // --- AUTHENTICATION CONTEXT ---
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
  }, [messages, loading]);

  const handleChat = async () => {
    if (!query.trim() || loading) return;
    
    const currentQuery = query.trim();
    setQuery('');
    
    // Instantly push the user's message to the UI
    setMessages(prev => [...prev, { role: 'user', content: currentQuery }]);
    setLoading(true);
    
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ai/chat', {
        query: currentQuery,
        email: userEmail 
      });
      
      // Push the AI's response to the UI
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) { 
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "⚠️ [SYSTEM ERROR]: Local Intelligence Link severed. Verify Ollama (Llama 3.2) status and Database Auth." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-[calc(100vh-160px)] flex flex-col max-w-6xl mx-auto font-inter"
    >
      {/* --- Authority Intelligence Header --- */}
      <div className="flex items-center justify-between border-b border-slate-800/40 pb-8 mb-8 shrink-0">
        <div className="flex items-center gap-5">
          <div className="relative">
            <motion.div 
              animate={loading ? { scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"
            />
            <div className="relative p-4 bg-[#0c121d] border border-blue-500/30 rounded-[1.5rem] shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              <Cpu className="text-blue-400" size={32} />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              AI <span className="text-blue-500">Consultant</span>
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                Neural Architecture: Llama 3.2 8B
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-end gap-2">
           <div className="flex items-center gap-2 px-4 py-2 bg-[#0c121d] rounded-2xl border border-white/5 shadow-inner">
             <ShieldCheck size={14} className="text-emerald-500" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID: {userEmail.split('@')[0]}</span>
           </div>
           <p className="text-[9px] font-bold text-slate-600 uppercase italic pr-2">Localhost Protocol v2.4</p>
        </div>
      </div>

      {/* --- Centralized Analysis Feed --- */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 md:px-4 space-y-8 custom-scrollbar mb-8 pr-4"
      >
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-4 md:gap-6 items-start ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {msg.role === 'assistant' ? (
                <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/5 mt-2">
                  <Sparkles size={20} className="text-blue-400" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/5 mt-2">
                  <User size={20} className="text-emerald-400" />
                </div>
              )}

              {/* Message Bubble */}
              <div className={`
                p-6 md:p-8 rounded-[2.5rem] border shadow-2xl relative backdrop-blur-2xl max-w-[85%]
                ${msg.role === 'user' 
                  ? 'bg-slate-800/40 border-slate-700/50 rounded-tr-none text-slate-200' 
                  : 'bg-[#0c121d]/80 border-blue-500/10 rounded-tl-none text-blue-50'
                }
              `}>
                <div className="text-sm md:text-base leading-[1.8] font-medium whitespace-pre-wrap">
                   {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Loading Indicator Bubble */}
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-6 items-start"
            >
              <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-2 shadow-lg shadow-blue-500/5">
                <Zap size={20} className="text-blue-400 animate-pulse" />
              </div>
              <div className="glass-card p-6 rounded-[2.5rem] rounded-tl-none border border-blue-500/10 relative bg-[#0c121d]/50 flex items-center gap-3">
                 <div className="flex gap-1.5">
                   <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                   <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                   <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                 </div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Querying Neural Core</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- High-Response Command Input --- */}
      <motion.div 
        layout
        className="relative group bg-[#0c121d] p-3 rounded-[2rem] border border-white/5 focus-within:border-blue-500/40 transition-all shadow-2xl shrink-0"
      >
        <div className="flex items-center gap-4">
          <div className="pl-5 text-slate-600">
            <Terminal size={22} />
          </div>
          <input 
            className="flex-1 bg-transparent py-4 text-white placeholder-slate-600 outline-none text-sm md:text-base font-bold tracking-tight"
            placeholder="Initialize financial audit query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
          />
          <motion.button 
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleChat}
            disabled={loading || !query.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 px-6 md:px-8 py-4 rounded-2xl text-white shadow-lg shadow-blue-600/20 disabled:shadow-none flex items-center gap-3 transition-all border border-white/10"
          >
            <Send size={18} className={loading ? "animate-pulse" : ""} />
            <span className="font-black text-[11px] uppercase tracking-widest hidden md:inline">Execute Strategy</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}