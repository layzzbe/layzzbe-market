import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { API_URL } from '../utils/api';

const CartContext = createContext();

const API = (path, method = 'GET', body) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    }).then(r => r.json());
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const isFetching = useRef(false);

    const showToast = useCallback((message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    }, []);

    // Load cart from DB on mount (when token exists)
    const fetchCart = useCallback(async () => {
        if (!localStorage.getItem('token') || isFetching.current) return;
        isFetching.current = true;
        try {
            const data = await API('/api/cart');
            if (Array.isArray(data)) setCart(data);
        } catch { /* silent */ }
        finally { isFetching.current = false; }
    }, []);

    useEffect(() => { fetchCart(); }, [fetchCart]);

    const addToCart = useCallback(async (product) => {
        if (!localStorage.getItem('token')) {
            showToast('Savatga qo\'shish uchun kirish kerak!');
            return;
        }
        // Optimistic update
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { ...product, quantity: 1 }];
        });
        showToast("✅ Mahsulot savatga qo'shildi!");
        try {
            await API('/api/cart', 'POST', { product_id: product.id, quantity: 1 });
        } catch { fetchCart(); } // revert on failure
    }, [showToast, fetchCart]);

    const removeFromCart = useCallback(async (productId) => {
        setCart(prev => prev.filter(i => i.id !== productId));
        try {
            await API(`/api/cart/${productId}`, 'DELETE');
        } catch { fetchCart(); }
    }, [fetchCart]);

    const increaseQuantity = useCallback(async (productId) => {
        setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity: i.quantity + 1 } : i));
        const item = cart.find(i => i.id === productId);
        if (item) {
            try {
                await API(`/api/cart/${productId}`, 'PUT', { quantity: item.quantity + 1 });
            } catch { fetchCart(); }
        }
    }, [cart, fetchCart]);

    const decreaseQuantity = useCallback(async (productId) => {
        const item = cart.find(i => i.id === productId);
        if (!item) return;
        if (item.quantity <= 1) {
            await removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity: i.quantity - 1 } : i));
        try {
            await API(`/api/cart/${productId}`, 'PUT', { quantity: item.quantity - 1 });
        } catch { fetchCart(); }
    }, [cart, removeFromCart, fetchCart]);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const cartCount = cart.reduce((t, i) => t + i.quantity, 0);
    const cartTotal = cart.reduce((t, i) => {
        const p = typeof i.price === 'string' ? parseFloat(i.price.replace('$', '')) : parseFloat(i.price) || 0;
        return t + p * i.quantity;
    }, 0);

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity,
            clearCart, cartCount, cartTotal, isCartOpen, setIsCartOpen,
            toastMessage, fetchCart,
        }}>
            {children}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-slate-900 border border-neon-blue rounded-2xl p-4 shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue font-bold">✓</div>
                        <p className="text-white font-medium">{toastMessage}</p>
                    </div>
                </div>
            )}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within a CartProvider');
    return ctx;
};
