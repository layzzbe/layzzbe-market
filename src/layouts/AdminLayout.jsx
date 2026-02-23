import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    Settings,
    Globe,
    LogOut,
    Activity,
    Shield
} from 'lucide-react';
import { API_URL } from '../utils/api';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Xavfsizlik: Tokenni tahlil qilish va Admin ekanligini tekshirish
    useEffect(() => {
        const verifyAdmin = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error("Sessiya yaroqsiz");
                }

                const data = await response.json();

                // Faqat 'is_admin' true bo'lgan foydalanuvchilar kirish huquqiga ega
                if (!data.is_admin) {
                    navigate('/');
                    return;
                }

                setUser(data);
            } catch (err) {
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        verifyAdmin();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navLinks = [
        { path: '/admin', alias: "Asosiy panel", icon: LayoutDashboard },
        { path: '/admin/products', alias: "Maxsulotlar", icon: Package },
        { path: '/admin/users', alias: "Foydalanuvchilar", icon: Users },
        { path: '/admin/orders', alias: "Buyurtmalar", icon: ShoppingCart },
        { path: '/admin/settings', alias: "Sozlamalar", icon: Settings },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <div className="relative">
                    <Shield className="w-16 h-16 text-neon-purple/50 animate-pulse absolute" />
                    <Activity className="w-16 h-16 text-neon-blue animate-spin" />
                </div>
                <h3 className="text-white mt-6 font-bold tracking-widest uppercase">Admin tizimi yuklanmoqda...</h3>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden">
            {/* Left Sidebar Fixed */}
            <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-[280px] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-50 shadow-[5px_0_30px_rgba(0,0,0,0.5)]"
            >
                {/* Brand Logo Header */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800">
                    <Link to="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-purple to-neon-blue flex items-center justify-center shadow-[0_0_15px_rgba(176,0,255,0.4)]">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tight">Admin <span className="text-neon-purple">Panel</span></span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path || (location.pathname.startsWith(link.path) && link.path !== '/admin');

                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-300 ${isActive
                                    ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/30 shadow-[0_0_15px_rgba(176,0,255,0.15)]"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-neon-purple drop-shadow-[0_0_8px_rgba(176,0,255,0.8)]" : ""}`} />
                                {link.alias}
                            </Link>
                        );
                    })}
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-slate-800 space-y-2">
                    {/* Admin Profile Details */}
                    <div className="mb-4 px-2 py-3 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-widest text-neon-blue mb-1">Joriy Admin</span>
                        <span className="text-sm font-bold text-slate-300 truncate" title={user?.email}>{user?.email}</span>
                    </div>

                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 font-bold hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <Globe className="w-5 h-5 text-neon-blue" />
                        Saytga qaytish
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 font-bold hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Chiqish
                    </button>
                </div>
            </motion.aside>

            {/* Dynamic Right Content Area */}
            <main className="flex-1 relative overflow-y-auto bg-slate-950 custom-scrollbar">
                {/* Background Decorators */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neon-blue/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />

                {/* Router Outlet for rendering dynamic Nested Pages */}
                <div className="relative z-10 p-8 min-h-full">
                    <Outlet context={{ user }} />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
