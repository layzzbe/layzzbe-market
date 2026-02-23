import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';

/**
 * AdminRoute — RBAC guard for all /admin/* routes.
 *
 * Decision tree (only runs after UserContext resolves):
 *   loading=true      → spinner (no premature decisions on hard-refresh)
 *   !user             → <Navigate to="/login" />
 *   !user.is_admin    → inline "Kirish taqiqlangan" + Logout button (NO redirect loop)
 *   user.is_admin     → <Outlet /> (AdminLayout + page)
 */
const AdminRoute = () => {
    const { user, loading, logout } = useUser();

    // 1. Wait for UserContext to fully resolve (handles hard-refresh)
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
                <p className="text-slate-400 text-sm font-bold tracking-wide">Yuklanmoqda...</p>
            </div>
        );
    }

    // 2. No token / user
    if (!user) return <Navigate to="/login" replace />;

    // 3. Logged in but NOT admin — render denial UI directly (no Navigate = no loops)
    if (!user.is_admin) {
        const handleLogout = () => {
            logout();
            window.location.href = '/login';
        };

        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
                <div className="flex flex-col items-center gap-6 text-center animate-in fade-in duration-300">
                    <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <span className="text-4xl">🚫</span>
                    </div>

                    <div className="space-y-2">
                        <p className="font-black text-white text-2xl">Kirish taqiqlangan</p>
                        <p className="text-red-400 text-sm">
                            Sizda bu sahifaga kirish huquqi yo'q!
                        </p>
                        <p className="text-slate-600 text-xs mt-1">
                            Ushbu sahifa faqat administrator uchun mo'ljallangan.
                        </p>
                    </div>

                    {/* Logout so a real admin can log in */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all font-bold text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Tizimdan chiqish
                    </button>
                </div>
            </div>
        );
    }

    // 4. ✅ True admin
    return <Outlet />;
};

export default AdminRoute;
