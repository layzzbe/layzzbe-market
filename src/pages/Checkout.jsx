import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, CreditCard, Wallet, ArrowLeft, CheckCircle2, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

const USD_TO_UZS = 12800;

// ── Inline Toast ──────────────────────────────────────────────
const Toast = ({ msg, type }) => (
    <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16 }}
        className={`fixed top-6 right-6 z-[300] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl text-sm font-bold ${type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
    >
        {type === 'success'
            ? <CheckCircle className="w-5 h-5 shrink-0 text-green-400" />
            : <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />}
        {msg}
    </motion.div>
);

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { formatPrice } = useCurrency();
    const { user, updateBalance } = useUser();
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [toast, setToast] = useState(null);
    const [walletError, setWalletError] = useState('');

    const userBalance = user?.balance ?? 0;
    const totalUZS = Math.round(cartTotal * USD_TO_UZS);
    const hasEnoughBalance = userBalance >= totalUZS;

    // Pre-fill from UserContext
    const [userName, setUserName] = useState(user?.full_name || '');
    const userEmail = user?.email || '';

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    // ── Empty / cart-missing state ─────────────────────────────
    if (cart.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-neon-blue/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
                <div className="text-center relative z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-10 max-w-lg shadow-2xl w-full">
                    <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-slate-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Savatingiz bo'sh</h1>
                    <p className="text-slate-400 mb-8 text-lg">Xarid qilish uchun mahsulotlar katalogiga o'ting.</p>
                    <Link to="/products" className="inline-flex w-full justify-center px-6 py-4 rounded-xl bg-neon-blue text-slate-950 text-lg font-bold hover:bg-neon-blue/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                        Mahsulotlarni ko'rish
                    </Link>
                </div>
            </div>
        );
    }

    // ── Wallet payment ─────────────────────────────────────────
    const handleWalletPayment = async () => {
        setIsProcessing(true);
        setWalletError('');
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        try {
            const res = await fetch('/api/orders/process-wallet-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                // Only send product_id + quantity — backend reads real prices from DB
                body: JSON.stringify({
                    cart_items: cart.map(item => ({
                        product_id: item.id,
                        quantity: item.quantity
                    }))
                })
            });
            const data = await res.json();
            if (!res.ok) {
                // FastAPI may return {detail: [...]} array for validation errors
                let errMsg = "Ma'lumotlarni yuborishda xatolik";
                if (typeof data.detail === 'string') {
                    errMsg = data.detail;
                } else if (Array.isArray(data.detail)) {
                    errMsg = data.detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
                }
                throw new Error(errMsg);
            }

            // Re-fetch balance from DB via UserContext
            await updateBalance();
            clearCart();
            showToast("Xarid muvaffaqiyatli amalga oshirildi! 🎉", 'success');
            setTimeout(() => navigate('/dashboard'), 1800);
        } catch (err) {
            // Network-level error (server down / CORS / wrong URL)
            const isNetworkErr = err.message === 'Failed to fetch' || err.message === 'Network Error';
            setWalletError(
                isNetworkErr
                    ? "Server bilan aloqa yo'q. Dastur ishlayotganini tekshiring."
                    : err.message || "Noma'lum xatolik yuz berdi"
            );
            setIsProcessing(false);
        }
    };

    // ── Click / Payme payment redirect ──────────────────────────
    const handleClickPayment = async () => {
        setIsProcessing(true);
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        try {
            const res = await fetch('/api/orders/generate-payment-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    cart_items: cart.map(item => ({
                        title: item.title,
                        image: item.image || '',
                        product_id: item.id,
                        quantity: item.quantity,
                    })),
                    total_usd: cartTotal,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                const msg = typeof data.detail === 'string' ? data.detail : "To'lov havolasi yaratishda xatolik";
                showToast(msg, 'error');
                setIsProcessing(false);
                return;
            }
            // Redirect to Click payment page
            window.location.href = data.payment_url;
        } catch (err) {
            console.error('Click payment error:', err);
            // Try to extract real backend error if fetch succeeded but response parsing threw
            const msg = err?.message || "To'lovda xatolik yuz berdi";
            showToast(msg, 'error');
            setIsProcessing(false);
        }
    };

    // ── Card / Payme simulyatsiya ────────────────────────────────
    const handleCardPayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            clearCart();
            showToast("To'lov muvaffaqiyatli qabul qilindi! ✅", 'success');
            setTimeout(() => navigate('/dashboard'), 1800);
        }, 1500);
    };

    const handlePayment = (e) => {
        e.preventDefault();
        if (paymentMethod === 'wallet') {
            handleWalletPayment();
        } else if (paymentMethod === 'app') {
            handleClickPayment();
        } else {
            // 'card' — still simulated (no real card gateway yet)
            setIsProcessing(true);
            setTimeout(() => {
                clearCart();
                showToast("To'lov muvaffaqiyatli qabul qilindi! ✅", 'success');
                setTimeout(() => navigate('/dashboard'), 1800);
            }, 1500);
        }
    };

    return (
        <div className="min-h-screen relative pb-24 pt-12">
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-neon-purple/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-blue/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />

            <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group font-medium">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Orqaga
                </button>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-10 tracking-tight">Chekaut</h1>

                <div className="flex flex-col lg:flex-row gap-10 items-start">

                    {/* Left: Payment methods */}
                    <div className="flex-1 w-full space-y-8">
                        {/* Personal info — auto-filled from UserContext */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Shaxsiy ma'lumotlar</h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">To'liq ismingiz</label>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={e => setUserName(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-neon-blue transition-colors text-lg"
                                        placeholder="Isminiz va familiyangiz"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
                                        Elektron pochta
                                        <span className="ml-2 text-[10px] font-black text-slate-500 normal-case tracking-normal border border-slate-700 px-1.5 py-0.5 rounded">🔒 O'zgartirib bo'lmaydi</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={userEmail}
                                        readOnly
                                        disabled
                                        className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl px-5 py-3.5 text-slate-400 cursor-not-allowed text-lg select-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment method tabs */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">To'lov usuli</h2>

                            <div className="grid grid-cols-3 gap-3 mb-7">
                                {[
                                    { id: 'card', icon: CreditCard, label: "Kredit Karta", active: 'neon-blue' },
                                    { id: 'wallet', icon: Wallet, label: "Hamyon", active: 'neon-purple' },
                                    { id: 'app', icon: CreditCard, label: "Payme / Click", active: 'green-400' },
                                ].map(({ id, icon: Icon, label }) => {
                                    const sel = paymentMethod === id;
                                    const activeMap = { card: 'border-neon-blue text-neon-blue bg-neon-blue/10 shadow-[0_0_12px_rgba(0,240,255,0.2)]', wallet: 'border-neon-purple text-neon-purple bg-neon-purple/10 shadow-[0_0_12px_rgba(176,0,255,0.2)]', app: 'border-green-400 text-green-400 bg-green-400/10 shadow-[0_0_12px_rgba(74,222,128,0.2)]' };
                                    return (
                                        <button key={id} onClick={() => setPaymentMethod(id)}
                                            className={`py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 border-2 transition-all text-sm ${sel ? activeMap[id] : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                                            <Icon className="w-5 h-5" />
                                            {label}
                                            {id === 'wallet' && <span className="text-[10px] font-black">{Math.round(userBalance).toLocaleString('uz-UZ')} so'm</span>}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Card form */}
                            {paymentMethod === 'card' && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Karta raqami</label>
                                        <div className="relative">
                                            <input type="text" maxLength={19} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3.5 pl-12 text-white focus:outline-none focus:border-neon-blue transition-colors text-lg tracking-widest font-mono" placeholder="0000 0000 0000 0000" />
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        </div>
                                    </div>
                                    <div className="flex gap-5">
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Muddati</label>
                                            <input type="text" maxLength={5} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-neon-blue transition-colors text-lg text-center" placeholder="MM/YY" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">CVC</label>
                                            <input type="password" maxLength={3} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-neon-blue transition-colors text-lg text-center font-mono" placeholder="•••" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Wallet panel */}
                            {paymentMethod === 'wallet' && (
                                <div className="rounded-2xl border border-neon-purple/30 bg-neon-purple/5 p-6 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Wallet className="w-8 h-8 text-neon-purple shrink-0" />
                                        <div>
                                            <p className="text-slate-300 font-bold text-sm">Hamyon balansi</p>
                                            <p className="text-2xl font-black text-neon-purple">{Math.round(userBalance).toLocaleString('uz-UZ')} so'm</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-neon-purple/20 pt-3 flex items-center justify-between text-sm">
                                        <span className="text-slate-400 font-bold">Xarid summasi:</span>
                                        <span className="font-black text-white">{totalUZS.toLocaleString('uz-UZ')} so'm</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 font-bold">Qolgan balans:</span>
                                        <span className={`font-black ${hasEnoughBalance ? 'text-green-400' : 'text-red-400'}`}>
                                            {Math.max(0, Math.round(userBalance - totalUZS)).toLocaleString('uz-UZ')} so'm
                                        </span>
                                    </div>
                                    {!hasEnoughBalance && (
                                        <div className="flex items-center gap-2 text-yellow-400 text-sm font-bold bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-4 py-2.5">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            Balans yetarli emas.{' '}
                                            <Link to="/payments" className="underline hover:text-yellow-300">Hamyonni to'ldiring</Link>
                                        </div>
                                    )}
                                    {hasEnoughBalance && (
                                        <p className="text-green-400 text-sm font-bold flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> Balans yetarli — to'lovga tayyor
                                        </p>
                                    )}
                                    {walletError && (
                                        <p className="text-red-400 text-sm font-bold flex items-center gap-2 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">
                                            <AlertCircle className="w-4 h-4 shrink-0" />{walletError}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Payme / Click panel */}
                            {paymentMethod === 'app' && (
                                <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">Click Uz orqali to'lov</p>
                                            <p className="text-slate-400 text-xs">Rasmiy Click to'lov tizimi</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-green-400/10 pt-3 flex items-center justify-between text-sm">
                                        <span className="text-slate-400 font-bold">To'lov summasi:</span>
                                        <span className="font-black text-green-400">{(Math.round(cartTotal * USD_TO_UZS)).toLocaleString('uz-UZ')} so'm</span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        "To'lovni amalga oshirish" tugmasini bossangiz, Click to'lov sahifasiga yo'naltirilasiz.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Order summary */}
                    <div className="w-full lg:w-[450px] shrink-0 sticky top-28">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-neon-purple/5 blur-[80px] rounded-full pointer-events-none" />
                            <h2 className="text-2xl font-bold text-white mb-6">Buyurtma xulosasi</h2>

                            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-700 bg-slate-950">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-bold text-sm truncate">{item.title}</h4>
                                            <p className="text-slate-400 text-xs mt-0.5">Miqdor: {item.quantity}</p>
                                        </div>
                                        <div className="text-white font-black">
                                            {formatPrice(
                                                (typeof item.price === 'string'
                                                    ? parseFloat(item.price.replace('$', ''))
                                                    : parseFloat(item.price) || 0
                                                ) * item.quantity
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-800 pt-5 mb-4 space-y-2">
                                <div className="flex justify-between text-slate-400 text-sm">
                                    <span>Oraliq summa</span>
                                    <span>{formatPrice(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400 text-sm">
                                    <span>Soliq / QQS</span>
                                    <span>Bepul</span>
                                </div>
                                {paymentMethod === 'wallet' && (
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-400">UZS da</span>
                                        <span className="text-neon-purple">{totalUZS.toLocaleString('uz-UZ')} so'm</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <span className="text-slate-300 font-medium text-lg">Jami</span>
                                <span className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(176,0,255,0.4)]">
                                    {formatPrice(cartTotal)}
                                </span>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isProcessing || (paymentMethod === 'wallet' && !hasEnoughBalance)}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple text-white text-lg font-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_30px_rgba(176,0,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {isProcessing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : null}
                                {paymentMethod === 'wallet' ? "Hamyon bilan to'lash" :
                                    paymentMethod === 'app' ? "Click orqali to'lash →" :
                                        "To'lovni amalga oshirish"}
                            </button>

                            <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1.5">
                                <Lock className="w-3 h-3" /> To'lov xavfsiz va shifrlangan
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
