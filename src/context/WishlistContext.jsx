import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_URL } from '../utils/api';

const WishlistContext = createContext();

const API = (path, method = 'GET') => {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    }).then(r => r.json());
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = useCallback((message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    }, []);

    // Load wishlist from DB on mount
    const fetchWishlist = useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const data = await API('/api/wishlist');
            if (Array.isArray(data)) setWishlist(data);
        } catch { /* silent */ }
    }, []);

    useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

    const toggleWishlist = useCallback(async (product) => {
        if (!localStorage.getItem('token')) {
            showToast("Ko'ngildagilarga qo'shish uchun kirish kerak!");
            return;
        }
        const liked = wishlist.some(i => i.id === product.id);
        // Optimistic update
        if (liked) {
            setWishlist(prev => prev.filter(i => i.id !== product.id));
            showToast("Ko'ngildagilardan olib tashlandi");
        } else {
            setWishlist(prev => [...prev, product]);
            showToast("Ko'ngildagilarga qo'shildi! ❤️");
        }
        try {
            await API(`/api/wishlist/${product.id}`, 'POST');
        } catch { fetchWishlist(); } // revert on failure
    }, [wishlist, showToast, fetchWishlist]);

    const isLiked = useCallback((productId) => {
        return wishlist.some(i => i.id === productId);
    }, [wishlist]);

    const clearWishlist = useCallback(() => {
        setWishlist([]);
    }, []);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isLiked, clearWishlist, fetchWishlist }}>
            {children}
            {toastMessage && (
                <div className="fixed bottom-24 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
                    <div className="bg-slate-900 border border-neon-pink rounded-2xl p-4 shadow-[0_0_20px_rgba(255,0,153,0.2)] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neon-pink/20 flex items-center justify-center text-neon-pink font-bold">♥</div>
                        <p className="text-white font-medium">{toastMessage}</p>
                    </div>
                </div>
            )}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
    return ctx;
};
