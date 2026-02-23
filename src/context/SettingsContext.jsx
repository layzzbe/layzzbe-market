import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_URL } from '../utils/api';

const SettingsContext = createContext({});

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/settings/public`);
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch { /* backend may not be ready — fail silently */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    return (
        <SettingsContext.Provider value={{ settings, loading, fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
