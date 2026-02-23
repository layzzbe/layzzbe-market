import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, ShoppingBag, CreditCard, LogOut,
    Download, AlertCircle, ShieldCheck, Activity, CheckCircle, Package, Wallet
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { API_URL } from '../utils/api';

// ── Toast ─────────────────────────────────────────────────────
const Toast = ({ message, type }) => (
    <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10 }}
        className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl font-bold text-sm ${type === 'success'
            ? 'bg-green-500/10 border-green-500/40 text-green-300'
            : 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue'
            }`}
    >
        {type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <Package className="w-5 h-5 shrink-0" />}
        <span>{message}</span>
    </motion.div>
);

const USD_TO_UZS = 12800;
const formatUZS = (usd) => Math.round(usd * USD_TO_UZS).toLocaleString('uz-UZ') + " so'm";
const formatDate = (str) => str ? new Date(str).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

const STATUS_PAID = ['completed', 'paid'];

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, fetchUser, logout } = useUser();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        const fetchAll = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }

            try {
                // fetchUser updates the global context (balance sync)
                const userData = await fetchUser();
                if (!userData) { navigate('/login'); return; }

                const ordersRes = await fetch(`${API_URL}/api/orders/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (ordersRes.ok) setOrders(await ordersRes.json());
            } catch {
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, [navigate, fetchUser]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleDownload = (orderTitle) => {
        showToast(`"${orderTitle}" — Mahsulot fayllari tayyorlanmoqda...`, 'info');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, scale: 0.97, y: 16 },
        show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Activity className="w-10 h-10 text-neon-blue animate-spin" />
            </div>
        );
    }

    const paidOrders = orders.filter(o => STATUS_PAID.includes(o.status));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="min-h-screen relative pb-24 pt-12"
        >
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-neon-blue/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-neon-purple/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />

            {/* Toast */}
            <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} />}</AnimatePresence>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* ── Sidebar ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="w-full lg:w-[300px] shrink-0"
                    >
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sticky top-28">
                            {/* Profile header */}
                            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-800 mb-6 relative">
                                {user?.is_admin && (
                                    <div className="absolute top-0 right-0 bg-neon-purple/20 text-neon-purple border border-neon-purple/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(176,0,255,0.3)] flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Admin
                                    </div>
                                )}
                                {/* Avatar */}
                                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple p-0.5 mb-4 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-4 border-slate-900">
                                        <span className="text-2xl font-black text-white">
                                            {(user?.full_name || user?.email || '?')[0].toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                {/* Name / email */}
                                <h2 className="text-base font-black text-white mb-0.5 truncate max-w-full px-2">
                                    {user?.full_name || user?.email}
                                </h2>
                                {user?.full_name && (
                                    <p className="text-xs text-slate-500 truncate max-w-full px-2">{user.email}</p>
                                )}
                            </div>

                            {/* Nav */}
                            <nav className="space-y-1.5">
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-neon-blue/10 text-neon-blue border border-neon-blue/30 text-sm font-bold">
                                    <ShoppingBag className="w-5 h-5" />
                                    Mening xaridlarim
                                    {paidOrders.length > 0 && (
                                        <span className="ml-auto bg-neon-blue text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                                            {paidOrders.length}
                                        </span>
                                    )}
                                </button>
                                <Link to="/settings?tab=profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-bold">
                                    <User className="w-5 h-5" />
                                    Shaxsiy ma'lumotlar
                                </Link>
                                <Link to="/payments" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-bold">
                                    <CreditCard className="w-5 h-5" />
                                    To'lov tarixi
                                </Link>
                            </nav>

                            {/* Balance widget */}
                            <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-neon-blue/20">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-neon-blue" />
                                        <span className="text-[11px] font-black uppercase tracking-widest text-neon-blue">Hamyon</span>
                                    </div>
                                    <Link to="/payments" className="text-[10px] font-bold text-slate-500 hover:text-neon-blue transition-colors">To'ldirish →</Link>
                                </div>
                                <p className="text-white font-black text-lg">
                                    {Math.round(user?.balance || 0).toLocaleString('uz-UZ')} so'm
                                </p>
                            </div>

                            <div className="mt-6 pt-5 border-t border-slate-800">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm font-bold"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Chiqish
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Main content ── */}
                    <div className="flex-1 w-full min-w-0">
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Mening xaridlarim</h1>
                            <p className="text-slate-400">Siz xarid qilgan barcha raqamli mahsulotlar va loyihalar</p>
                        </div>

                        {paidOrders.length > 0 ? (
                            <motion.div
                                variants={containerVariants} initial="hidden" animate="show"
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {paidOrders.map(order => (
                                    <motion.div
                                        key={order.id} variants={itemVariants}
                                        className="group rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-neon-blue/40 transition-colors duration-300 flex flex-col"
                                    >
                                        {/* Image / placeholder */}
                                        <div className="w-full h-40 bg-slate-950 relative overflow-hidden shrink-0">
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10 opacity-80" />
                                            {order.product_image ? (
                                                <img
                                                    src={order.product_image} alt={order.product_title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neon-blue/10 to-neon-purple/10">
                                                    <Package className="w-16 h-16 text-slate-700" />
                                                </div>
                                            )}
                                            {/* Xarid qilingan badge */}
                                            <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-lg bg-neon-blue font-bold text-[10px] text-slate-950 uppercase tracking-wider shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                                                Xarid qilingan
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-5 flex flex-col flex-1">
                                            {order.product_category && (
                                                <p className="text-xs font-bold text-neon-purple uppercase tracking-wider mb-1">
                                                    {order.product_category}
                                                </p>
                                            )}
                                            <h3 className="text-base font-black text-white mb-1 line-clamp-2 leading-snug">
                                                {order.product_title || "Noma'lum mahsulot"}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 mb-4">
                                                <span className="text-green-400 font-black text-sm">${order.amount_usd}</span>
                                                <span className="text-slate-600 text-xs">{formatUZS(order.amount_usd)}</span>
                                                <span className="ml-auto text-slate-600 text-xs">{formatDate(order.created_at)}</span>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-slate-800">
                                                <button
                                                    onClick={() => handleDownload(order.product_title)}
                                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-green-500/20 text-slate-300 hover:text-green-400 border border-slate-700 hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(74,222,128,0.2)] transition-all duration-300 font-bold text-sm group/btn"
                                                >
                                                    <Download className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                    Yuklab olish
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-slate-900/60 border border-slate-800 rounded-3xl p-14 text-center flex flex-col items-center"
                            >
                                <div className="w-20 h-20 mb-6 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
                                    <AlertCircle className="w-10 h-10 text-slate-600" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Xaridlar mavjud emas</h3>
                                <p className="text-slate-400 mb-8 max-w-sm">
                                    Siz hali hech qanday mahsulot xarid qilmadingiz. Katalogga o'tib, yangi loyihalarni kashf eting.
                                </p>
                                <Link
                                    to="/products"
                                    className="px-8 py-3 rounded-xl bg-neon-blue text-slate-950 font-black hover:bg-neon-blue/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] text-sm"
                                >
                                    Katalogga o'tish
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
