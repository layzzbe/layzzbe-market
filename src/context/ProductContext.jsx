import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                if (!response.ok) {
                    throw new Error("Tarmoqda xatolik yuz berdi");
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError("Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos, server ishlayotganini tekshiring.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Global Loading Screen (Glassmorphism & Neon Spinner)
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative flex items-center justify-center"
                >
                    {/* Glowing outer rings */}
                    <div className="absolute w-32 h-32 rounded-full border-t-2 border-l-2 border-neon-blue animate-spin shadow-[0_0_30px_rgba(0,240,255,0.4)]" style={{ animationDuration: '1.5s' }}></div>
                    <div className="absolute w-24 h-24 rounded-full border-r-2 border-b-2 border-neon-purple animate-spin-reverse shadow-[0_0_20px_rgba(176,0,255,0.4)]" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                    <div className="absolute w-16 h-16 rounded-full border-t-2 border-r-2 border-neon-pink animate-spin shadow-[0_0_15px_rgba(255,0,153,0.4)]" style={{ animationDuration: '1s' }}></div>

                    {/* Center Icon/Text */}
                    <div className="absolute font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 text-glow">
                        LM
                    </div>
                </motion.div>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 text-slate-300 font-bold tracking-widest uppercase text-sm"
                >
                    Ma'lumotlar yuklanmoqda...
                </motion.p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
                <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 max-w-lg text-center box-glow">
                    <h2 className="text-2xl font-black text-red-400 mb-4">Ulanish xatosi</h2>
                    <p className="text-slate-300 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors border border-slate-700"
                    >
                        Qayta urinib ko'rish
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ProductContext.Provider value={{ products, setProducts }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
