import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Heart, User, Shield, LogOut, Globe2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { useUser } from '../context/UserContext';

const Navbar = () => {
    const { cartCount, clearCart } = useCart();
    const { wishlist, clearWishlist } = useWishlist();
    const { currency, setCurrency, formatPrice } = useCurrency();
    const { user } = useUser();
    const location = useLocation();
    const navigate = useNavigate();

    const isAuthenticated = !!localStorage.getItem('token');
    const isAdmin = user?.is_admin === true;

    const handleLogout = () => {
        localStorage.removeItem('token');
        clearCart();
        clearWishlist();
        window.location.href = '/login';
    };

    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/70 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 cursor-pointer group">
                    <Zap className="text-neon-blue w-6 h-6 group-hover:scale-110 transition-transform text-glow" />
                    <span className="text-xl font-black tracking-tight text-white group-hover:text-slate-200 transition-colors">
                        Layzzbe <span className="text-neon-blue text-glow">Market</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link to="/" className="font-semibold text-sm hover:text-neon-blue transition-colors text-white">Asosiy</Link>
                    <Link to="/products" className="font-semibold text-sm hover:text-neon-pink transition-colors text-slate-300">Maxsulotlar</Link>
                </div>

                <div className="flex items-center gap-4">
                    {/* Wishlist Heart */}
                    <Link to="/wishlist" className="relative p-2 text-slate-300 hover:text-white transition-colors group" aria-label="Wishlist">
                        <Heart className="w-6 h-6 group-hover:text-neon-pink transition-colors text-glow" />
                        {wishlist.length > 0 ? (
                            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-neon-pink text-[10px] font-black text-white rounded-full border-2 border-slate-950 shadow-[0_0_10px_rgba(255,0,153,0.5)] transform group-hover:scale-110 transition-transform">
                                {wishlist.length}
                            </span>
                        ) : (
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-slate-700 rounded-full border-2 border-slate-950 group-hover:bg-neon-pink transition-colors" />
                        )}
                    </Link>

                    {/* Cart Icon → /cart page */}
                    <Link
                        to="/cart"
                        className="relative p-2 text-slate-300 hover:text-white transition-colors group"
                        aria-label="Savatcha"
                    >
                        <ShoppingCart className="w-6 h-6 group-hover:text-neon-blue transition-colors text-glow" />
                        {cartCount > 0 ? (
                            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-neon-blue text-[10px] font-black text-white rounded-full border-2 border-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.5)] transform group-hover:scale-110 transition-transform">
                                {cartCount}
                            </span>
                        ) : (
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-slate-700 rounded-full border-2 border-slate-950 group-hover:bg-neon-blue transition-colors" />
                        )}
                    </Link>

                    {/* Currency Selector */}
                    <div className="relative group flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 ml-2 hover:border-neon-blue/50 transition-colors">
                        <Globe2 className="w-4 h-4 text-slate-400 group-hover:text-neon-blue transition-colors" />
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="bg-transparent text-slate-300 text-sm font-bold pl-1 pr-6 py-1 appearance-none focus:outline-none cursor-pointer"
                        >
                            <option value="USD">USD</option>
                            <option value="UZS">UZS</option>
                            <option value="RUB">RUB</option>
                        </select>
                        <div className="absolute right-2 pointer-events-none">
                            <span className="text-slate-500 text-[10px]">▼</span>
                        </div>
                    </div>

                    {/* Auth Area */}
                    {isAuthenticated ? (
                        <>
                            {/* Balance badge — all logged-in users */}
                            {user && (() => {
                                const balUZS = user.balance ?? 0;
                                let display;
                                if (currency === 'USD') {
                                    display = '$' + (balUZS / 12800).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                } else if (currency === 'RUB') {
                                    display = (balUZS / 92).toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';
                                } else {
                                    display = Math.round(balUZS).toLocaleString('uz-UZ') + " so'm";
                                }
                                return (
                                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neon-blue/10 border border-neon-blue/25 shadow-[0_0_12px_rgba(0,240,255,0.1)]">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-neon-blue">Balans</span>
                                        <span className="text-sm font-black text-white">{display}</span>
                                    </div>
                                );
                            })()}

                            {/* Admin link — ONLY if user.is_admin === true */}
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className={`hidden md:flex items-center gap-2 p-1.5 pr-4 pl-1.5 rounded-full border transition-all mr-2 ${location.pathname.startsWith('/admin')
                                        ? 'bg-neon-purple/10 border-neon-purple/50 shadow-[0_0_15px_rgba(176,0,255,0.2)]'
                                        : 'bg-slate-900 border-slate-700 hover:border-neon-purple/50 hover:bg-slate-800'
                                        }`}
                                    title="Admin Panel"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center border border-slate-950 shadow-inner">
                                        <Shield className="w-4 h-4 text-neon-purple" />
                                    </div>
                                    <span className={`text-sm font-bold ${location.pathname.startsWith('/admin') ? 'text-white' : 'text-slate-300'}`}>Boshqarish</span>
                                </Link>
                            )}

                            {/* Profile → Dashboard */}
                            <Link
                                to="/dashboard"
                                className={`hidden md:flex items-center gap-2 p-1.5 pr-4 pl-1.5 rounded-full border transition-all ${location.pathname === '/dashboard' || location.pathname === '/settings'
                                    ? 'bg-neon-blue/10 border-neon-blue/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                                    : 'bg-slate-900 border-slate-700 hover:border-neon-blue/50 hover:bg-slate-800'
                                    }`}
                                title="Shaxsiy Kabinet"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center border border-slate-950 shadow-inner">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <span className={`text-sm font-bold ${location.pathname === '/dashboard' || location.pathname === '/settings' ? 'text-white' : 'text-slate-300'}`}>Profil</span>
                            </Link>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="p-2 ml-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors group"
                                title="Chiqish"
                            >
                                <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="ml-4 px-6 py-2 bg-neon-blue text-slate-950 font-bold rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all hover:bg-neon-blue/90 text-sm"
                        >
                            Kirish
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
