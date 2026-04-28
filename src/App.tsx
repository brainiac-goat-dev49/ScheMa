/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { 
  Zap, 
  Layout, 
  Command, 
  ArrowRight, 
  Mail, 
  Shield, 
  Users, 
  Download,
  Lock,
  ChevronRight,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, addDoc, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { auth, db } from "./lib/firebase";

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/// --- Components ---

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-6 md:px-12 pt-8 pb-4 relative z-20">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center">
          <Zap className="text-white w-4.5 h-4.5 fill-current" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">SchemaMind</span>
      </div>
      {/* Admin button removed for privacy as requested */}
    </nav>
  );
};

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus("loading");
    setMessage("");
    
    try {
      const waitlistRef = collection(db, "waitlist");
      await addDoc(waitlistRef, {
        email: email.trim(),
        timestamp: new Date().toISOString(),
      });
      
      setStatus("success");
      setMessage("Success! You're on the list.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage("Failed to join. Please try again.");
      handleFirestoreError(err, OperationType.CREATE, "waitlist");
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden flex flex-col relative">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-20" />

      <Navbar />
      
      <main className="flex-1 flex flex-col justify-center px-6 md:px-12 relative z-10 gap-16 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                Beta Access Now Open
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-white">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI Architect</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-md leading-relaxed font-light">
                Turn simple text prompts into professional system design SVGs. Automate your architectural workflow with Natural Language.
              </p>
            </div>

            <div className="space-y-4 max-w-[420px]" id="signup">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 p-1.5 bg-slate-800/50 border border-slate-700 rounded-2xl focus-within:border-indigo-500/50 transition-all shadow-xl">
                <input 
                  type="email" 
                  required
                  placeholder="Enter your work email..." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 flex-1 px-4 py-3 text-slate-200 placeholder:text-slate-500"
                />
                <button 
                  disabled={status === "loading"}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap disabled:opacity-50"
                >
                  {status === "loading" ? "..." : "Join Waitlist"}
                </button>
              </form>
              
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-3 rounded-xl text-[13px] border text-center ${
                      status === "success" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}
                  >
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!message && (
                <p className="text-[11px] text-slate-500 ml-4 font-mono uppercase tracking-widest opacity-60">
                  No spam. Join 2,500+ architects.
                </p>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative group w-full"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition" />
            <div className="relative bg-slate-950 border border-slate-800 rounded-[2rem] aspect-video w-full overflow-hidden shadow-2xl flex flex-col">
              <div className="h-10 border-b border-slate-800 bg-slate-900/50 flex items-center px-6 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="ml-auto flex items-center gap-2 text-[10px] font-mono text-slate-600">
                  <Shield className="w-3 h-3" />
                  PROD ENV
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center relative bg-grid-pattern bg-[size:20px_20px]">
                <div className="w-20 h-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all group/play group-hover:scale-105 transition-all">
                  <Play className="text-white fill-current translate-x-1 w-8 h-8 group-hover/play:text-indigo-400 group-hover/play:scale-110 transition-all" />
                </div>
                <div className="absolute bottom-6 left-6 right-6 space-y-3">
                  <div className="h-1.5 bg-slate-900 w-full rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: "0%" }}
                      whileInView={{ width: "40%" }}
                      transition={{ duration: 1.5, delay: 1 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" 
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-500 lowercase tracking-tight">
                    <span className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       prompt: create aws 3-tier vpc...
                    </span>
                    <span>00:12 / 00:30</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-16 border-t border-slate-800/50 max-w-7xl mx-auto w-full">
          <FeatureCard 
            icon={<Download className="w-5 h-5 text-indigo-400" />}
            title="Instant SVG Generation"
            description="Download high-quality, editable vector files for your documentation instantly."
            bgColor="bg-indigo-500/10"
            borderColor="border-indigo-500/20"
          />
          <FeatureCard 
            icon={<Layout className="w-5 h-5 text-violet-400" />}
            title="Real-time Canvas"
            description="Watch your architecture grow as you type. Collaborate with your team."
            bgColor="bg-violet-500/10"
            borderColor="border-violet-500/20"
          />
          <FeatureCard 
            icon={<Command className="w-5 h-5 text-emerald-400" />}
            title="Natural Language Commands"
            description="Describe components and scaling logic in plain English. No more drag-and-drop."
            bgColor="bg-emerald-500/10"
            borderColor="border-emerald-500/20"
          />
        </div>
      </main>

      <footer className="px-12 py-10 border-t border-slate-800/50 flex justify-center items-center text-[13px] text-slate-500 font-light relative z-10">
        <p>© 2024 SchemaMind AI. Engineered with precision.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, bgColor, borderColor }: { icon: any, title: string, description: string, bgColor: string, borderColor: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="space-y-4 group"
  >
    <div className={`w-11 h-11 rounded-xl ${bgColor} ${borderColor} border flex items-center justify-center transition-transform group-hover:scale-110`}>
      {icon}
    </div>
    <h3 className="font-semibold text-lg text-white group-hover:text-indigo-300 transition-colors">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed font-light">{description}</p>
  </motion.div>
);

// --- Admin Panel ---

const AdminPanel = () => {
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchEmails();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const waitlistRef = collection(db, "waitlist");
      const q = query(waitlistRef, orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmails(data);
    } catch (err) {
      console.error("Failed to fetch emails:", err);
      setError("Permission denied. Ensure you are an authorized admin.");
      handleFirestoreError(err, OperationType.LIST, "waitlist");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, adminEmail, password);
      // Auth state listener handles the rest
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const getBccLink = () => {
    const list = emails.map(e => e.email).join(",");
    return `mailto:admin@schemamind.ai?bcc=${list}&subject=Early Access Invite: SchemaMind`;
  };

  if (loading) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm relative z-10"
        >
          <div className="text-center mb-10">
            <button 
              onClick={() => navigate("/")}
              className="w-12 h-12 bg-slate-800/50 rounded-2xl border border-white/5 flex items-center justify-center mx-auto mb-6 hover:bg-slate-800 transition-all hover:scale-110"
            >
              <Zap className="text-indigo-400 w-6 h-6 fill-current" />
            </button>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Vault</h1>
            <p className="text-slate-500 mt-2 text-sm">Sign in to manage SchemaMind.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              required
              placeholder="Admin Email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-600 shadow-inner"
            />
            <div className="relative group">
              <input
                type="password"
                required
                placeholder="Secret Key..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-600 shadow-inner"
              />
              <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <button 
              disabled={actionLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              {actionLoading ? "Decrypting..." : "Access Dashboard"}
            </button>
            {error && <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center text-red-400 text-xs font-mono tracking-tighter"
            >
              [ERROR]: {error}
            </motion.p>}
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen text-slate-200 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto p-6 md:p-12 relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-white tracking-tight">Waitlist Terminal</h1>
            <p className="text-slate-500 text-sm font-light">Authenticated as {user.email}. <span className="text-emerald-500/60">{emails.length} signals intercepted.</span></p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 rounded-xl transition-all"
            >
              Logout
            </button>
            <a 
              href={getBccLink()}
              className="px-6 py-2.5 bg-white text-slate-900 text-xs font-bold rounded-xl flex items-center hover:bg-slate-200 transition-all shadow-lg"
            >
              <Users className="mr-2 w-3.5 h-3.5" />
              BULK COMMS (BCC)
            </a>
          </div>
        </header>

        <div className="bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Subject Address</th>
                  <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Registration Event</th>
                  <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 text-right">Integrity</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((row, i) => (
                  <tr key={row.id || i} className="border-t border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-bold border border-indigo-500/20">
                          {row.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-white">{row.email}</span>
                      </div>
                    </td>
                    <td className="px-10 py-5 text-xs text-slate-500 font-mono">
                      {new Date(row.timestamp).toLocaleDateString()} // {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-10 py-5 text-right">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                        Verified
                      </div>
                    </td>
                  </tr>
                ))}
                {emails.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-10 py-20 text-center text-slate-600 font-mono text-xs uppercase tracking-widest italic animate-pulse">
                      Silence. No data received.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin-040806" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}
