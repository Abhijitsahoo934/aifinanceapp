import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an analytics service here
    console.error("System Critical Failure:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060b13] flex items-center justify-center p-6 text-white font-inter">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full glass-card p-10 rounded-[3rem] border border-red-500/20 text-center space-y-6 bg-[#0c121d]/50 backdrop-blur-3xl"
          >
            <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
              <AlertTriangle className="text-red-500" size={40} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight uppercase italic">System <span className="text-red-500">Anomaly</span></h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Quantum Handshake Interrupted</p>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              An unexpected error occurred within the intelligence node. Your data is safe, but the view layer needs to recalibrate.
            </p>

            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw size={14} /> Attempt Recalibration
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
              >
                <Home size={14} /> Return to Core
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;