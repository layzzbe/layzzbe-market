import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CartDrawer = () => {
    const {
        isCartOpen, setIsCartOpen,
        cart, removeFromCart, cartTotal,
        increaseQuantity, decreaseQuantity
    } = useCart();
    const navigate = useNavigate();

    if (!isCartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100]"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-slate-900 shadow-2xl z-[110] border-l border-slate-800/80 flex flex-col"
            >
                {/* Header */}
                <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 backdrop-blur-md shrink-0">
                    <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                        <ShoppingBag className="w-5 h-5 text-neon-blue" />
                        Xarid Savati
                        {cart.length > 0 && (
                            <span className="text-xs font-black bg-neon-blue text-slate-950 px-2 py-0.5 rounded-full">
                                {cart.reduce((s, i) => s + i.quantity, 0)} ta
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-5 scrollbar-hide space-y-4">
                    <AnimatePresence mode="popLayout">
                        {cart.length === 0 ? (
                            <motion.div key="empty"
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="h-full min-h-[60vh] flex flex-col items-center justify-center text-slate-600 space-y-4"
                            >
                                <ShoppingBag className="w-20 h-20 opacity-15" />
                                <p className="text-lg font-bold text-slate-500">Savatingiz hozircha bo'sh</p>
                                <p className="text-sm text-slate-600 text-center max-w-xs">
                                    Mahsulotlar sahifasiga o'tib, sevimli loyihalaringizni qo'shing
                                </p>
                                <button
                                    onClick={() => { setIsCartOpen(false); navigate('/products'); }}
                                    className="mt-2 px-5 py-2.5 rounded-xl bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-sm font-bold hover:bg-neon-blue/20 transition-colors"
                                >
                                    Mahsulotlarni ko'rish
                                </button>
                            </motion.div>
                        ) : (
                            cart.map((item) => {
                                const priceNum = typeof item.price === 'string'
                                    ? parseFloat(item.price.replace('$', ''))
                                    : parseFloat(item.price) || 0;
                                const itemTotal = (priceNum * item.quantity).toFixed(2);

                                return (
                                    <motion.div key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 40, scale: 0.95 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                                        className="flex gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 group"
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-slate-900">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            {item.category && (
                                                <p className="text-[10px] font-black text-neon-blue uppercase tracking-widest mb-1">{item.category}</p>
                                            )}
                                            <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 mb-3">{item.title}</h3>

                                            {/* Quantity controls + price row */}
                                            <div className="flex items-center justify-between">
                                                {/* +/- stepper */}
                                                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                                                    <button
                                                        onClick={() => decreaseQuantity(item.id)}
                                                        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                                        title={item.quantity === 1 ? "O'chirish" : "Kamaytirish"}
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-black text-white">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => increaseQuantity(item.id)}
                                                        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-neon-blue/20 hover:text-neon-blue transition-colors"
                                                        title="Ko'paytirish"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {/* Price */}
                                                <span className="text-base font-black text-white ml-2">${itemTotal}</span>

                                                {/* Trash */}
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="ml-2 w-8 h-8 flex items-center justify-center rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/15 transition-all"
                                                    title="Olib tashlash"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-5 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-400 font-bold">Jami summa:</span>
                            <motion.span
                                key={cartTotal.toFixed(2)}
                                initial={{ scale: 1.12, color: '#00f0ff' }}
                                animate={{ scale: 1, color: '#ffffff' }}
                                transition={{ duration: 0.3 }}
                                className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                            >
                                ${cartTotal.toFixed(2)}
                            </motion.span>
                        </div>
                        <button
                            onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple text-white text-base font-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_25px_rgba(176,0,255,0.35)] hover:shadow-[0_0_35px_rgba(0,240,255,0.5)] flex items-center justify-center gap-2"
                        >
                            To'lovga o'tish <span className="opacity-75 text-lg">→</span>
                        </button>
                    </div>
                )}
            </motion.div>
        </>
    );
};

export default CartDrawer;
