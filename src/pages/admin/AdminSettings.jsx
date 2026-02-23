import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, CreditCard, Send, Bell, Shield, Database,
    ChevronDown, Zap, Globe, Lock, Save, CheckCircle, RefreshCw,
    Instagram, Wrench, Mail, BarChart2, ToggleLeft, ToggleRight
} from 'lucide-react';

const API = async (path, method = 'GET', body) => {
    const token = localStorage.getItem('token');
    const res = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return res.json();
};

// Single accordion section
const Section = ({ icon: Icon, title, description, color = 'neon-blue', fields, values, onChange }) => {
    const [open, setOpen] = useState(false);

    // Count filled: toggles count if not default empty
    const filledCount = fields.filter(f => {
        const v = values[f.key];
        return f.type === 'toggle' ? v === 'true' : (v ?? '').toString().trim() !== '';
    }).length;

    return (
        <div className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all ${open ? `border-${color}/40` : 'border-slate-800'}`}>
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between p-5 group"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl bg-${color}/10 border border-${color}/20 flex items-center justify-center group-hover:bg-${color}/20 transition-colors`}>
                        <Icon className={`w-5 h-5 text-${color}`} />
                    </div>
                    <div className="text-left">
                        <p className="font-black text-white">{title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {description
                                ? <span className="text-slate-600 italic">{description}</span>
                                : <>{filledCount}/{fields.length} ta to'ldirilgan</>
                            }
                        </p>
                    </div>
                </div>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                </motion.div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className={`border-t border-${color}/20 px-5 py-5 space-y-4`}>
                            {description && (
                                <p className="text-xs text-slate-500 leading-relaxed -mt-1 mb-2">{description}</p>
                            )}
                            {fields.map(({ key, label, type = 'text', placeholder }) => (
                                <div key={key}>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">
                                        {label}
                                    </label>
                                    {type === 'toggle' ? (
                                        <button
                                            type="button"
                                            onClick={() => onChange(key, values[key] === 'true' ? 'false' : 'true')}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all w-full ${values[key] === 'true'
                                                    ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-300'
                                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                                                }`}
                                        >
                                            <div className={`w-10 h-6 rounded-full relative transition-colors ${values[key] === 'true' ? 'bg-yellow-400' : 'bg-slate-700'}`}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${values[key] === 'true' ? 'left-5' : 'left-1'}`} />
                                            </div>
                                            <span className="font-bold text-sm">
                                                {values[key] === 'true' ? '🔴 Sayt yopiq (Maintenance ON)' : '🟢 Sayt ishlayapti (Maintenance OFF)'}
                                            </span>
                                        </button>
                                    ) : (
                                        <input
                                            type={type}
                                            value={values[key] ?? ''}
                                            onChange={e => onChange(key, e.target.value)}
                                            placeholder={placeholder || label}
                                            className={`w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-${color}/60 transition-colors placeholder:text-slate-600`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SECTIONS = [
    {
        icon: CreditCard, title: 'Payme integratsiyasi', color: 'neon-blue',
        fields: [
            { key: 'payme_merchant_id', label: 'Merchant ID', placeholder: 'Payme merchant ID...' },
            { key: 'payme_secret_key', label: 'Secret Key', type: 'password', placeholder: '••••••••••••••••' },
        ]
    },
    {
        icon: CreditCard, title: 'Click integratsiyasi', color: 'neon-blue',
        fields: [
            { key: 'click_service_id', label: 'Service ID', placeholder: 'Click service ID...' },
            { key: 'click_merchant_id', label: 'Merchant ID', placeholder: 'Click merchant ID...' },
            { key: 'click_secret_key', label: 'Secret Key', type: 'password', placeholder: '••••••••••••••••' },
        ]
    },
    {
        icon: Send, title: 'Telegram Bot', color: 'neon-purple',
        fields: [
            { key: 'telegram_bot_token', label: 'Bot Token', placeholder: '1234567890:AAAA...' },
            { key: 'telegram_admin_id', label: 'Admin Chat ID', placeholder: '123456789' },
        ]
    },
    {
        icon: Bell, title: 'Bildirishnoma shablonlari', color: 'neon-purple',
        fields: [
            { key: 'notif_new_order', label: 'Yangi buyurtma xabari', placeholder: 'Yangi buyurtma #{id} ...' },
            { key: 'notif_topup', label: 'Balans to\'ldirildi xabari', placeholder: 'Hisobingiz {amount} ga to\'ldirildi.' },
        ]
    },
    {
        icon: Globe, title: 'Valyuta kursi', color: 'green-400',
        fields: [
            { key: 'usd_rate', label: 'USD → UZS kursi', type: 'number', placeholder: '12800' },
            { key: 'rub_rate', label: 'RUB → UZS kursi', type: 'number', placeholder: '140' },
        ]
    },
    {
        icon: Zap, title: 'Sayt ma\'lumotlari', color: 'yellow-400',
        fields: [
            { key: 'site_name', label: 'Sayt nomi', placeholder: 'Layzzbe Market' },
            { key: 'site_description', label: 'Sayt tavsifi', placeholder: 'Premium digital marketplace...' },
        ]
    },
    {
        icon: Lock, title: 'JWT sozlamalari', color: 'green-400',
        fields: [
            { key: 'jwt_expire_minutes', label: 'Token muddati (daqiqa)', type: 'number', placeholder: '1440' },
        ]
    },
    {
        icon: Database, title: "MySQL ma'lumotlar bazasi", color: 'green-400',
        fields: [
            { key: 'db_host', label: 'Host', placeholder: 'localhost' },
            { key: 'db_name', label: 'Database nomi', placeholder: 'layzzbe_market' },
        ]
    },
    {
        icon: Instagram, title: "Ijtimoiy Tarmoqlar", color: 'neon-pink',
        description: "Saytning pastki qismida (footer) chiqib turadigan ijtimoiy tarmoq havolalarini sozlash.",
        fields: [
            { key: 'instagram_link', label: 'Instagram', placeholder: 'https://instagram.com/layzzbe' },
            { key: 'telegram_channel', label: 'Telegram Kanal', placeholder: 'https://t.me/layzzbe' },
            { key: 'youtube_link', label: 'YouTube', placeholder: 'https://youtube.com/@layzzbe' },
        ]
    },
    {
        icon: Wrench, title: 'Texnik Xizmat Rejimi', color: 'yellow-400',
        description: "Saytni vaqtincha yopib qo'yish va mijozlarga xabar ko'rsatish.",
        fields: [
            { key: 'maintenance_mode', label: "Rejim (true / false)", type: 'toggle', placeholder: 'false' },
            { key: 'maintenance_message', label: 'Ko\'rsatiladigan xabar', placeholder: "Tez orada qaytamiz! Saytda ta'mirlash ishlari ketmoqda." },
        ]
    },
    {
        icon: Mail, title: 'Email / SMTP Sozlamalari', color: 'neon-blue',
        description: 'Foydalanuvchilarga xat yuborish uchun pochta serverini ulash.',
        fields: [
            { key: 'smtp_host', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
            { key: 'smtp_port', label: 'Port', type: 'number', placeholder: '587' },
            { key: 'smtp_user', label: 'Foydalanuvchi (Email)', placeholder: 'noreply@layzzbe.com' },
            { key: 'smtp_password', label: 'Parol', type: 'password', placeholder: '••••••••••••' },
        ]
    },
    {
        icon: BarChart2, title: 'Analitika va SEO', color: 'neon-purple',
        description: 'Saytga tashrif buyuruvchilarni kuzatish uchun analitika kodlarini kiritish.',
        fields: [
            { key: 'google_analytics_id', label: 'Google Analytics ID', placeholder: 'G-XXXXXXXXXX' },
            { key: 'yandex_metrika_id', label: 'Yandex Metrika ID', placeholder: '12345678' },
        ]
    },
];

const AdminSettings = () => {
    const [values, setValues] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await API('/api/admin/settings');
            if (data && typeof data === 'object' && !data.detail) setValues(data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const handleChange = (key, val) => setValues(v => ({ ...v, [key]: val }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await API('/api/admin/settings', 'POST', values);
            showToast('Sozlamalar muvaffaqiyatli saqlandi!', true);
        } catch {
            showToast('Xatolik yuz berdi. Qayta urinib ko\'ring.', false);
        } finally { setSaving(false); }
    };

    return (
        <div className="space-y-8 pb-32">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Sozlamalar</h1>
                    <p className="text-slate-400 mt-2">Tizim va platforma konfiguratsiyasi</p>
                </div>
                <button onClick={fetchSettings} disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 transition-colors text-sm">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Qayta yuklash
                </button>
            </motion.div>

            {/* Info banner */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.05 } }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-neon-blue/5 border border-neon-blue/15 text-sm">
                <Settings className="w-5 h-5 shrink-0 mt-0.5 text-neon-blue" />
                <p className="text-slate-400">
                    Barcha sozlamalar <span className="text-neon-blue font-bold">MySQL bazasida</span> saqlanadi.
                    Qatorni bosing — kengaytirilgan maydonlarni to'ldiring, so'ng pastdagi <span className="text-white font-bold">"Saqlash"</span> tugmasini bosing.
                </p>
            </motion.div>

            {/* Sections */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 animate-spin text-neon-blue" />
                    <span className="ml-3 text-slate-400 font-bold">Yuklanmoqda...</span>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }}
                    className="space-y-3">
                    {SECTIONS.map(s => (
                        <Section key={s.title} {...s} values={values} onChange={handleChange} />
                    ))}
                </motion.div>
            )}

            {/* Sticky Save Bar */}
            <div className="fixed bottom-0 left-[280px] right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-8 py-4 flex items-center justify-between">
                <p className="text-slate-400 text-sm">
                    Jami <span className="text-neon-blue font-bold">{Object.keys(values).length}</span> ta sozlama
                </p>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm transition-all bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] disabled:opacity-60"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.95 }}
                        className="fixed bottom-24 right-8 z-50"
                    >
                        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl ${toast.ok
                            ? 'bg-slate-900 border-green-500/40 shadow-green-500/10'
                            : 'bg-slate-900 border-red-500/40 shadow-red-500/10'
                            }`}>
                            <CheckCircle className={`w-5 h-5 ${toast.ok ? 'text-green-400' : 'text-red-400'}`} />
                            <span className="font-bold text-white text-sm">{toast.msg}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminSettings;
