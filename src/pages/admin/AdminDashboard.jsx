import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Users, Package, ShoppingCart, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { API_URL } from '../../utils/api';

const USD_TO_UZS = 12800;

const formatUZS = (uzs) => {
    if (uzs >= 1_000_000_000) return `${(uzs / 1_000_000_000).toFixed(1)} mlrd so'm`;
    if (uzs >= 1_000_000) return `${(uzs / 1_000_000).toFixed(1)} mln so'm`;
    return uzs.toLocaleString('uz-UZ') + " so'm";
};

const AdminDashboard = () => {
    const { user } = useOutletContext();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchStats = async (showRefresh = false) => {
        if (showRefresh) setIsRefreshing(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch(`${API_URL}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setStats(await res.json());
        } catch (err) {
            console.error("Statistika yuklashda xato:", err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    const statCards = stats ? [
        {
            title: "Jami Mahsulotlar",
            value: stats.products_count,
            sub: "ta raqamli mahsulot",
            icon: Package,
            color: "text-neon-blue",
            bg: "bg-neon-blue/10",
            border: "border-neon-blue/30",
            glow: "shadow-[0_0_20px_rgba(0,240,255,0.1)]"
        },
        {
            title: "Foydalanuvchilar",
            value: stats.users_count,
            sub: "ta ro'yxatdan o'tgan",
            icon: Users,
            color: "text-neon-purple",
            bg: "bg-neon-purple/10",
            border: "border-neon-purple/30",
            glow: "shadow-[0_0_20px_rgba(176,0,255,0.1)]"
        },
        {
            title: "Buyurtmalar",
            value: stats.orders_count,
            sub: "ta buyurtma bajarildi",
            icon: ShoppingCart,
            color: "text-neon-pink",
            bg: "bg-neon-pink/10",
            border: "border-neon-pink/30",
            glow: "shadow-[0_0_20px_rgba(255,0,153,0.1)]"
        },
        {
            title: "Jami Daromad",
            value: formatUZS(stats.total_revenue_uzs),
            sub: `$${stats.total_revenue_usd} USD`,
            icon: TrendingUp,
            color: "text-green-400",
            bg: "bg-green-400/10",
            border: "border-green-400/30",
            glow: "shadow-[0_0_20px_rgba(74,222,128,0.1)]"
        },
    ] : [];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="w-full h-full max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                        Xush kelibsiz, <span className="text-neon-blue text-glow">{user?.email?.split('@')[0]}</span>!
                    </h1>
                    <p className="text-slate-400 text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-neon-purple animate-pulse" />
                        Tizim ko'rsatkichlari barqaror va ishchi holatda
                    </p>
                </div>
                <button
                    onClick={() => fetchStats(true)}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-neon-blue/40 transition-all font-bold text-sm disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-neon-blue' : ''}`} />
                    Yangilash
                </button>
            </motion.div>

            {/* Stats Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse">
                            <div className="h-4 bg-slate-800 rounded mb-4 w-3/4" />
                            <div className="h-8 bg-slate-800 rounded mb-2 w-1/2" />
                            <div className="h-3 bg-slate-800 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : (
                <motion.div
                    variants={containerVariants} initial="hidden" animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    {statCards.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={idx} variants={itemVariants}
                                className={`p-6 rounded-3xl bg-slate-900 border ${stat.border} ${stat.glow} relative overflow-hidden group`}
                            >
                                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl ${stat.bg} group-hover:scale-150 transition-transform duration-700 ease-out`} />
                                <div className="flex items-start justify-between relative z-10">
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{stat.title}</p>
                                        <h3 className="text-2xl font-black text-white mb-1 leading-none">{stat.value}</h3>
                                        <p className="text-xs text-slate-500 font-medium">{stat.sub}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} border ${stat.border} shrink-0`}>
                                        <Icon className={`w-6 h-6 ${stat.color} drop-shadow-[0_0_8px_currentColor]`} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* Recent orders placeholder */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-white">So'nggi Xaridlar</h2>
                    <button className="text-sm font-bold text-neon-blue hover:text-neon-blue/80 transition-colors bg-neon-blue/10 px-4 py-2 rounded-lg">
                        Barchasini ko'rish
                    </button>
                </div>
                <div className="w-full text-center py-14 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/50">
                    <ShoppingCart className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 font-bold mb-1">Buyurtmalar tarixi</p>
                    <p className="text-sm text-slate-600">Bu blokda foydalanuvchilar qilgan xaridlar ko'rsatiladi</p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
