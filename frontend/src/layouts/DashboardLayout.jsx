import React, { useMemo, useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, MessageSquare, TrendingUp, BarChart2, LogOut, 
  ShieldCheck, Search, Bell, Settings, ChevronRight, Target, UserCircle,
  CheckCircle2, AlertTriangle, Info, X
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }) => {
  return (
    <NavLink to={to} className="relative group outline-none">
      {({ isActive }) => (
        <div className={`
          relative z-10 flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl transition-all duration-500
          ${isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-200'}
        `}>
          <div className="flex items-center gap-3">
            <Icon size={18} className={isActive ? "text-emerald-400" : "group-hover:text-emerald-500 transition-colors"} />
            <span className="font-bold tracking-tight text-[13px]">{label}</span>
          </div>
          {isActive && (
            <motion.div 
              layoutId="activePill" 
              className="absolute inset-0 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl -z-10 shadow-[0_0_20px_rgba(16,185,129,0.02)]" 
            />
          )}
          <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-all ${isActive ? 'translate-x-0 text-emerald-500 opacity-100' : '-translate-x-2 text-slate-700'}`} />
        </div>
      )}
    </NavLink>
  );
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Notification Engine State
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  
  // Simulated Intelligence Alerts (We will replace this with a FastAPI call later)
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', title: 'Goal Milestone', message: 'Emergency Fund reached 50%!', time: '10m ago', read: false },
    { id: 2, type: 'alert', title: 'Market Volatility', message: 'NIFTY 50 experiencing high trading volume.', time: '1h ago', read: false },
    { id: 3, type: 'info', title: 'AI Advisor Insight', message: 'New wealth strategy projection generated.', time: '2h ago', read: true }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Click outside listener to close the notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const userData = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      return {
        email: parsed?.email || "Guest@financepro.ai",
        role: parsed?.role || "Visitor"
      };
    } catch (error) {
      console.error("Dashboard Identity Sync Error:", error);
      return { email: "Guest@financepro.ai", role: "Visitor" };
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token'); 
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/').filter(Boolean).pop();
    if (!path || path === 'dashboard') return "SYSTEM OVERVIEW";
    return path.toUpperCase().replace('-', ' ');
  };

  return (
    <div className="flex h-screen bg-[#060b13] text-white overflow-hidden font-inter selection:bg-emerald-500/30 selection:text-emerald-400">
      
      {/* --- SIDEBAR ARCHITECTURE --- */}
      <aside className="w-80 border-r border-slate-800/40 flex flex-col p-8 bg-[#060b13] relative z-20 shadow-2xl">
        <div className="flex items-center gap-4 mb-12 px-2 group cursor-pointer" onClick={() => navigate('/dashboard')}>
          <motion.div 
            whileHover={{ rotate: -10, scale: 1.1 }}
            className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl shadow-2xl"
          >
            <ShieldCheck size={24} className="text-emerald-500" />
          </motion.div>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase italic leading-none">
              Finance<span className="text-emerald-500">Pro</span>
            </h1>
            <span className="text-[9px] font-black text-slate-600 tracking-[0.3em] uppercase">Intelligence Node</span>
          </div>
        </div>

        <div className="relative mb-10 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="Search Commands..." 
            className="w-full bg-slate-900/30 border border-slate-800/60 rounded-2xl py-3 pl-11 pr-4 text-[11px] font-bold focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-slate-700 shadow-inner"
          />
        </div>

        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4 px-4">Standard Menu</p>
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="System Overview" />
          <SidebarItem to="/analytics" icon={BarChart2} label="Global Analytics" /> 
          <SidebarItem to="/ai-advisor" icon={MessageSquare} label="Intelligence Advisor" />
          <SidebarItem to="/planner" icon={TrendingUp} label="Wealth Strategy" />
          <SidebarItem to="/goals" icon={Target} label="Objectives" />
          <SidebarItem to="/profile" icon={UserCircle} label="Authority Settings" />
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-800/40">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-4 text-slate-600 hover:text-red-400 transition-all w-full rounded-2xl hover:bg-red-500/5 group border border-transparent hover:border-red-500/10"
          >
            <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
            <span className="font-black text-[11px] uppercase tracking-widest">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN STAGE --- */}
      <main className="flex-1 flex flex-col relative bg-[#060b13] overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[150px] rounded-full pointer-events-none z-0" />

        <header className="h-24 border-b border-slate-800/40 flex items-center justify-between px-12 bg-[#060b13]/80 backdrop-blur-3xl z-50 relative">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
               {getPageTitle()}
               <motion.span 
                 animate={{ opacity: [0.3, 1, 0.3] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" 
               />
            </h2>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Quantum Data Handshake Active</p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 border-r border-slate-800/60 pr-8 relative" ref={dropdownRef}>
              
              {/* NOTIFICATION BELL */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 rounded-xl transition-all relative group border ${
                  showNotifications ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'
                }`}
              >
                <Bell size={16} className={unreadCount > 0 ? 'group-hover:animate-bounce' : ''} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-[#060b13] flex items-center justify-center">
                    <span className="absolute w-full h-full bg-emerald-500 rounded-full animate-ping opacity-75"></span>
                  </span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN MENU */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-14 right-14 w-80 bg-[#0c121d] border border-slate-800/80 shadow-2xl rounded-2xl overflow-hidden z-50 backdrop-blur-xl"
                  >
                    <div className="p-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/30">
                      <span className="text-xs font-black uppercase tracking-widest text-white">System Alerts</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-[9px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors">
                          Mark Read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-xs font-medium">No new alerts.</div>
                      ) : (
                        notifications.map((notify) => (
                          <div key={notify.id} className={`p-4 border-b border-white/5 flex gap-4 hover:bg-slate-800/30 transition-colors cursor-pointer ${!notify.read ? 'bg-emerald-500/[0.02]' : ''}`}>
                            <div className="mt-1">
                              {notify.type === 'success' && <CheckCircle2 size={16} className="text-emerald-500" />}
                              {notify.type === 'alert' && <AlertTriangle size={16} className="text-amber-500" />}
                              {notify.type === 'info' && <Info size={16} className="text-blue-500" />}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className={`text-[11px] font-black uppercase tracking-wider ${!notify.read ? 'text-white' : 'text-slate-400'}`}>{notify.title}</p>
                                <span className="text-[9px] font-bold text-slate-600">{notify.time}</span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed">{notify.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t border-slate-800/60 text-center bg-slate-900/30">
                      <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                        View All Telemetry
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SETTINGS GEAR - 📍 FIXED TO NAVIGATE TO PROFILE */}
              <button 
                onClick={() => navigate('/profile')}
                className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all hover:border-slate-700 group"
              >
                <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>

            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/profile')}>
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-black text-white leading-tight group-hover:text-emerald-400 transition-colors uppercase">
                  {userData.email?.split('@')[0] || "User"}
                </p>
                <p className="text-[9px] text-emerald-500/70 uppercase font-black tracking-widest mt-0.5">
                   {userData.role || 'User'} Authority
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white shadow-[0_10px_20px_rgba(16,185,129,0.1)] border border-white/10 uppercase text-lg">
                  {userData.email?.charAt(0) || "U"}
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-4 border-[#060b13] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </motion.div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}