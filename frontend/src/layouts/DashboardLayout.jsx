import React, { useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquare, 
  TrendingUp, 
  BarChart3, 
  LogOut, 
  ShieldCheck,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Target,
  UserCircle
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }) => {
  return (
    <NavLink to={to} className="relative group">
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
          
          <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-all ${isActive ? 'translate-x-0 text-emerald-500' : '-translate-x-2 text-slate-700'}`} />
        </div>
      )}
    </NavLink>
  );
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * ADVANCED ERROR PROTECTION: 
   * Wraps the localStorage retrieval in a useMemo with a try-catch block.
   * This prevents the "split of undefined" error by ensuring userData.email always exists.
   */
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
    if (!path) return "SYSTEM OVERVIEW";
    return path.toUpperCase().replace('-', ' ');
  };

  return (
    <div className="flex h-screen bg-[#060b13] text-white overflow-hidden font-inter selection:bg-emerald-500/30 selection:text-emerald-400">
      
      {/* Sidebar Architecture */}
      <aside className="w-80 border-r border-slate-800/40 flex flex-col p-8 bg-[#060b13] relative z-20">
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
            className="w-full bg-slate-900/30 border border-slate-800/60 rounded-2xl py-3 pl-11 pr-4 text-[11px] font-bold focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-slate-700"
          />
        </div>

        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar">
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4 px-4">Standard Menu</p>
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="System Overview" />
          <SidebarItem to="/market" icon={BarChart3} label="Market Analytics" />
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

      <main className="flex-1 flex flex-col relative bg-[#060b13]">
        <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[150px] rounded-full pointer-events-none" />

        <header className="h-24 border-b border-slate-800/40 flex items-center justify-between px-12 bg-[#060b13]/40 backdrop-blur-3xl z-10">
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
            <div className="flex items-center gap-3 border-r border-slate-800/60 pr-8">
              <button className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all hover:border-slate-700 relative">
                <Bell size={16} />
                <span className="absolute top-2 right-2 h-2 w-2 bg-emerald-500 rounded-full border-2 border-[#060b13]" />
              </button>
              <button className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all hover:border-slate-700" onClick={() => navigate('/settings')}>
                <Settings size={16} />
              </button>
            </div>

            {/* ERROR-PROOF PROFILE SECTION */}
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/profile')}>
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-black text-white leading-tight group-hover:text-emerald-400 transition-colors uppercase">
                  {/* Using optional chaining and fallback for the split function */}
                  {userData.email?.split('@')[0] || "User"}
                </p>
                <p className="text-[9px] text-emerald-500/70 uppercase font-black tracking-widest mt-0.5">
                   {userData.role || 'User'} Authority
                </p>
              </div>
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white shadow-[0_10px_20px_rgba(16,185,129,0.1)] border border-white/10 uppercase">
                  {userData.email?.charAt(0) || "U"}
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-4 border-[#060b13] rounded-full shadow-sm" />
              </div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto custom-scrollbar p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}