import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Fingerprint, Loader2, Sparkles } from 'lucide-react';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Capture the "Financial Authority" credentials from the URL
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const email = searchParams.get('email');
    const level = searchParams.get('level') || 'beginner';

    const handleAuth = async () => {
      // 2. Security Theater: Small delay to signify "Encryption & Handshake"
      await new Promise(resolve => setTimeout(resolve, 1800));

      if (token && email) {
        // 3. Persist session to local storage
        localStorage.setItem('token', token);
        localStorage.setItem('userPersona', JSON.stringify({ 
          role: role || 'student', 
          email: email, 
          level: level 
        }));
        
        // 4. Redirect to the core ecosystem
        navigate('/dashboard');
      } else {
        console.error("Auth Failure: Insufficient session data received from authority nodes.");
        navigate('/login');
      }
    };

    handleAuth();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#060b13] flex items-center justify-center relative overflow-hidden font-inter">
      {/* --- Ambient Background Glows --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center text-center max-w-sm px-8"
      >
        {/* --- Cyber-Security Loader --- */}
        <div className="relative mb-12">
          {/* Outer Rotating Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="w-28 h-28 border-2 border-dashed border-emerald-500/20 rounded-full"
          />
          {/* Inner Pulsing Ring */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-4 border-2 border-blue-500/30 rounded-2xl"
          />
          {/* Center Fingerprint Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Fingerprint className="text-emerald-500" size={36} />
            </motion.div>
          </div>
        </div>

        {/* --- Progress & Feedback --- */}
        <div className="space-y-6">
          <div className="space-y-2">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-black text-white tracking-tighter uppercase italic"
            >
              Verifying <span className="text-emerald-500">Identity</span>
            </motion.h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
              Handshaking with Auth Nodes
            </p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="flex items-center gap-2 px-5 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl">
              <ShieldCheck className="text-emerald-500" size={16} />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Secure Tunnel Established
              </span>
            </div>
            
            <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
              "Calibrating your personalized financial intelligence dashboard..."
            </p>
          </motion.div>
        </div>

        {/* --- Bottom Status Bar (Scanning Effect) --- */}
        <div className="absolute -bottom-16 left-0 w-full h-[2px] bg-slate-900 overflow-hidden rounded-full">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
            />
        </div>
      </motion.div>
    </div>
  );
}