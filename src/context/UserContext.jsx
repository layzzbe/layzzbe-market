import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // true until first fetchUser completes

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) { setUser(null); setLoading(false); return null; }
        try {
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) { localStorage.removeItem('token'); setUser(null); return null; }
            const data = await res.json();
            setUser(data);
            return data;
        } catch {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);

    // After topup/purchase: re-fetch from backend so balance is always from real DB
    const updateBalance = useCallback(async () => {
        await fetchUser();
    }, [fetchUser]);

    // Auto-fetch on mount — resolves loading once done
    useEffect(() => { fetchUser(); }, [fetchUser]);

    return (
        <UserContext.Provider value={{ user, setUser, fetchUser, logout, updateBalance, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within a UserProvider');
    return ctx;
};
