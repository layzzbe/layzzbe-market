import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, TrendingUp, TrendingDown, Clock, ArrowLeft, Wallet, Plus, AlertCircle, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { API_URL } from '../utils/api';

const USD_TO_UZS = 12800;
const formatUZS = (uzs) => Math.round(uzs).toLocaleString('uz-UZ') + " so'm";
const formatDate = (str) => str ? new Date(str).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

const TYPE_CONFIG = {
    TOPUP: {
        label: "To'ldirish",
        icon: TrendingUp,
        color: 'text-green-400',
        bg: 'bg-green-400/10',
        border: 'border-green-400/20',
        sign: '+'
    },
    PURCHASE: {
        label: 'Xarid',
        icon: TrendingDown,
        color: 'text-red-400',
        bg: 'bg-red-400/10',
        border: 'border-red-400/20',
        sign: '-'
    },
};

// ── TopUp Modal ───────────────────────────────────────────────
const TopUpModal = ({ balance, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const PRESETS = [10000, 25000, 50000, 100000, 250000, 500000];

    const handleTopUp = async () => {
        const val = parseFloat(amount);
        if (!val || val <= 0) { setError("Summa kiritish shart"); return; }
        setIsLoading(true); setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/balance/topup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ amount_uzs: val })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            onSuccess(data.balance, val);
        } catch (e) {
            setError(e.message || "Xatolik yuz berdi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 20 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="relative w-full max-w-md bg-slate-900 border border-neon-blue/30 rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden"
            >
                <div className="absolute -top-16 -left-16 w-48 h-48 bg-neon-blue/15 rounded-full blur-[60px] pointer-events-none" />
                <div className="p-6 border-b border-slate-800 bg-slate-950/40 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-neon-blue/15 border border-neon-blue/30 rounded-xl flex items-center justify-center">
                            <Wallet className="w-4 h-4 text-neon-blue" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-black text-neon-blue">Hamyonni to'ldirish</p>
                            <p className="text-sm font-bold text-white">Joriy balans: {formatUZS(balance)}</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4 relative z-10">
                    {/* Presets */}
                    <div className="grid grid-cols-3 gap-2">
                        {PRESETS.map(p => (
                            <button key={p} onClick={() => setAmount(String(p))}
                                className={`py-2.5 rounded-xl text-sm font-black border transition-all ${String(amount) === String(p) ? 'bg-neon-blue/15 border-neon-blue/50 text-neon-blue' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}>
                                {(p / 1000).toFixed(0)}K
                            </button>
                        ))}
                    </div>
                    {/* Custom */}
                    <div className="relative">
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                            placeholder="Yoki miqdor kiriting..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-neon-blue/50 font-medium pr-16 transition-colors" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">so'm</span>
                    </div>
                    {error && <p className="text-red-400 text-sm font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</p>}
                    <div className="flex gap-3 pt-1">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold text-sm hover:bg-slate-800 hover:text-white transition-colors">Bekor</button>
                        <button onClick={handleTopUp} disabled={isLoading}
                            className="flex-1 py-3 rounded-xl bg-neon-blue text-slate-950 font-black text-sm hover:bg-neon-blue/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2">
                            {isLoading ? <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                            Qo'shish
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// ── Main ──────────────────────────────────────────────────────
const PaymentHistory = () => {
    const navigate = useNavigate();
    const { user, fetchUser, updateBalance } = useUser();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showTopUp, setShowTopUp] = useState(false);

    // Balance always comes from global UserContext (DB-backed)
    const balance = user?.balance ?? 0;

    const fetchTransactions = async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        try {
            const txRes = await fetch(`${API_URL}/api/transactions/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (txRes.ok) setTransactions(await txRes.json());
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // fetchUser updates UserContext (balance synced from DB)
        fetchUser().then(() => fetchTransactions());
    }, []);

    const handleTopUpSuccess = async () => {
        setShowTopUp(false);
        // Re-fetch balance from DB via UserContext
        await updateBalance();
        // Re-fetch transactions list
        await fetchTransactions();
    };

    const totalTopup = transactions.filter(t => t.type === 'TOPUP').reduce((s, t) => s + t.amount, 0);
    const totalSpent = transactions.filter(t => t.type === 'PURCHASE').reduce((s, t) => s + t.amount, 0);

    return (
        <div className="min-h-screen relative pb-24 pt-12">
            <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-neon-purple/8 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-neon-blue/8 blur-[150px] rounded-full pointer-events-none" />

            <AnimatePresence>
                {showTopUp && <TopUpModal balance={balance} onClose={() => setShowTopUp(false)} onSuccess={handleTopUpSuccess} />}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Kabinetga qaytish
                </Link>

                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">To'lov tarixi</h1>
                    <p className="text-slate-400">Barcha tranzaksiyalar va hamyon holati</p>
                </motion.div>

                {/* Stats row */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
                    {/* Balance card */}
                    <div className="md:col-span-1 bg-slate-900 border border-neon-blue/30 rounded-3xl p-5 shadow-[0_0_25px_rgba(0,240,255,0.1)] relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 w-28 h-28 bg-neon-blue/10 rounded-full blur-xl" />
                        <div className="flex items-center gap-2 mb-3">
                            <Wallet className="w-4 h-4 text-neon-blue" />
                            <p className="text-[11px] font-black uppercase tracking-widest text-neon-blue">Joriy balans</p>
                        </div>
                        <p className="text-2xl font-black text-white mb-4">{formatUZS(balance)}</p>
                        <button onClick={() => setShowTopUp(true)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neon-blue text-slate-950 font-black text-sm hover:bg-neon-blue/90 transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                            <Plus className="w-4 h-4" /> To'ldirish
                        </button>
                    </div>

                    <div className="bg-slate-900 border border-green-400/20 rounded-3xl p-5 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-400/8 rounded-full blur-xl" />
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <p className="text-[11px] font-black uppercase tracking-widest text-green-400">Jami to'ldirildi</p>
                        </div>
                        <p className="text-xl font-black text-white">{formatUZS(totalTopup)}</p>
                    </div>

                    <div className="bg-slate-900 border border-red-400/20 rounded-3xl p-5 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-400/8 rounded-full blur-xl" />
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <p className="text-[11px] font-black uppercase tracking-widest text-red-400">Jami xaridlar</p>
                        </div>
                        <p className="text-xl font-black text-white">{formatUZS(totalSpent)}</p>
                    </div>
                </motion.div>

                {/* Transactions table */}
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12 }}
                    className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                    <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                        <h2 className="font-black text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-neon-purple" /> Tranzaksiyalar
                        </h2>
                        <span className="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full">{transactions.length} ta</span>
                    </div>

                    {isLoading ? (
                        <div className="p-16 text-center">
                            <Activity className="w-8 h-8 text-neon-blue animate-spin mx-auto" />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="p-16 text-center">
                            <Clock className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500 font-bold">Hali hech qanday tranzaksiya mavjud emas</p>
                            <p className="text-slate-600 text-sm mt-1">Hamyoningizni to'ldiring va xarid qiling</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800/60">
                            {transactions.map((tx, i) => {
                                const cfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.PURCHASE;
                                const Icon = cfg.icon;
                                return (
                                    <motion.div key={tx.id}
                                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-800/20 transition-colors">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                                            <Icon className={`w-5 h-5 ${cfg.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white text-sm truncate">{tx.description || cfg.label}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />{formatDate(tx.created_at)}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`font-black text-base ${cfg.color}`}>
                                                {cfg.sign}{formatUZS(tx.amount)}
                                            </p>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentHistory;
