import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

const Cart = () => {
    const {
        cart, removeFromCart, increaseQuantity, decreaseQuantity, cartTotal, clearCart
    } = useCart();
    const { formatPrice } = useCurrency();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative pt-12 pb-32">
            {/* Background glows */}
            <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-neon-blue/8 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-neon-purple/8 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                {/* Back */}
                <button onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group text-sm font-bold">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Orqaga
                </button>

                {/* Title */}
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Xarid Savati</h1>
                        {cart.length > 0 && (
                            <p className="text-slate-400 mt-1 font-medium">{cart.reduce((s, i) => s + i.quantity, 0)} ta mahsulot</p>
                        )}
                    </div>
                    {cart.length > 0 && (
                        <button onClick={clearCart}
                            className="text-xs font-bold text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 rounded-xl transition-colors">
                            Barchasini o'chirish
                        </button>
                    )}
                </motion.div>

                {/* Empty state */}
                {cart.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-28 bg-slate-900/50 border border-slate-800 rounded-3xl">
                        <ShoppingCart className="w-20 h-20 text-slate-700 mx-auto mb-5" />
                        <h2 className="text-2xl font-black text-white mb-2">Savatingiz bo'sh</h2>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                            Xarid qilish uchun mahsulotlar katalogiga o'ting va o'zingizga yoqqan loyihalarni qo'shing.
                        </p>
                        <Link to="/products"
                            className="inline-flex px-8 py-3.5 rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-black hover:scale-[1.02] transition-all shadow-[0_0_25px_rgba(176,0,255,0.35)]">
                            Mahsulotlarni ko'rish
                        </Link>
                    </motion.div>
                ) : (
                    <div className="flex flex-col xl:flex-row gap-8 items-start">
                        {/* Items list */}
                        <div className="flex-1 w-full space-y-4">
                            <AnimatePresence mode="popLayout">
                                {cart.map((item, idx) => {
                                    const priceNum = typeof item.price === 'string'
                                        ? parseFloat(item.price.replace('$', ''))
                                        : parseFloat(item.price) || 0;

                                    return (
                                        <motion.div key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.04 } }}
                                            exit={{ opacity: 0, x: 60, scale: 0.95 }}
                                            className="flex gap-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors group"
                                        >
                                            {/* Image */}
                                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden shrink-0 border border-slate-700/50 bg-slate-950">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                <div>
                                                    {item.category && (
                                                        <p className="text-[10px] font-black text-neon-blue uppercase tracking-widest mb-1">{item.category}</p>
                                                    )}
                                                    <h3 className="text-white font-bold text-base leading-snug line-clamp-2 mb-1">{item.title}</h3>
                                                    <p className="text-slate-400 text-sm font-medium">{formatPrice(priceNum)} / dona</p>
                                                </div>

                                                {/* Bottom row: stepper + total + remove */}
                                                <div className="flex items-center gap-4 mt-4">
                                                    {/* Qty stepper */}
                                                    <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl overflow-hidden">
                                                        <button onClick={() => decreaseQuantity(item.id)}
                                                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/15 transition-colors"
                                                            title={item.quantity === 1 ? "O'chirish" : "Kamaytirish"}>
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <span className="w-9 text-center text-sm font-black text-white">
                                                            {item.quantity}
                                                        </span>
                                                        <button onClick={() => increaseQuantity(item.id)}
                                                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-neon-blue hover:bg-neon-blue/15 transition-colors">
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    {/* Item total */}
                                                    <span className="text-lg font-black text-white">
                                                        {formatPrice(priceNum * item.quantity)}
                                                    </span>

                                                    {/* Trash */}
                                                    <button onClick={() => removeFromCart(item.id)}
                                                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 text-xs font-bold hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                        O'chirish
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Order summary */}
                        <div className="w-full xl:w-[380px] shrink-0 sticky top-28">
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                                className="bg-slate-900 border border-slate-800 rounded-3xl p-7 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-neon-purple/5 blur-[60px] rounded-full pointer-events-none" />
                                <h2 className="text-xl font-black text-white mb-6">Buyurtma xulosasi</h2>

                                {/* Per-item mini list */}
                                <div className="space-y-3 mb-5">
                                    {cart.map(item => {
                                        const priceNum = typeof item.price === 'string'
                                            ? parseFloat(item.price.replace('$', ''))
                                            : parseFloat(item.price) || 0;
                                        return (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="text-slate-400 truncate max-w-[200px]">{item.title} × {item.quantity}</span>
                                                <span className="text-slate-300 font-bold ml-3 shrink-0">{formatPrice(priceNum * item.quantity)}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="border-t border-slate-800 pt-5 mb-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300 font-bold text-lg">Jami summa:</span>
                                        <motion.span
                                            key={cartTotal.toFixed(4)}
                                            initial={{ scale: 1.1, color: '#00f0ff' }}
                                            animate={{ scale: 1, color: '#ffffff' }}
                                            className="text-3xl font-black text-white drop-shadow-[0_0_12px_rgba(0,240,255,0.35)]">
                                            {formatPrice(cartTotal)}
                                        </motion.span>
                                    </div>
                                </div>

                                <Link to="/checkout"
                                    className="block w-full py-4 rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple text-white text-center text-lg font-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_25px_rgba(176,0,255,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.5)]">
                                    To'lovga o'tish →
                                </Link>

                                <Link to="/products"
                                    className="block w-full text-center text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors mt-4">
                                    Xaridni davom ettirish
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
