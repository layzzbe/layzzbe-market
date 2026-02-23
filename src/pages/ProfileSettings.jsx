import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, Lock, Save, CheckCircle, AlertCircle, Eye, EyeOff, Shield, Activity, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

// ── Toast ─────────────────────────────────────────────────────
const Toast = ({ message, type }) => (
    <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className={`fixed top-6 right-6 z-[300] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl font-bold text-sm ${type === 'success'
                ? 'bg-green-500/10 border-green-500/40 text-green-300 shadow-[0_0_20px_rgba(74,222,128,0.15)]'
                : 'bg-red-500/10 border-red-500/40 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
            }`}
    >
        {type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
        <span>{message}</span>
    </motion.div>
);

// ── Field ──────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, disabled, rightEl }) => (
    <div className="space-y-2">
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</label>
        <div className="relative group">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-neon-blue transition-colors" />
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-10 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-neon-blue/60 focus:shadow-[0_0_15px_rgba(0,240,255,0.08)] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {rightEl && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>}
        </div>
    </div>
);

const formatDate = (dateStr) => {
    if (!dateStr) return "Noma'lum";
    return new Date(dateStr).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
};

// ── Tabs ───────────────────────────────────────────────────────
const TABS = [
    { id: 'profile', label: 'Shaxsiy ma\'lumotlar', icon: User },
    { id: 'security', label: 'Xavfsizlik', icon: Lock },
];

// ── Main ──────────────────────────────────────────────────────
const ProfileSettings = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') === 'security' ? 'security' : 'profile';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Profile form state
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Password form state
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [isChangingPass, setIsChangingPass] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Sync tab with URL param
    const switchTab = (id) => {
        setActiveTab(id);
        setSearchParams({ tab: id });
    };

    // Sync on URL change (e.g. navigating from Dashboard sidebar)
    useEffect(() => {
        const t = searchParams.get('tab');
        if (t === 'security' || t === 'profile') setActiveTab(t);
    }, [searchParams]);

    useEffect(() => {
        const fetchMe = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            try {
                const res = await fetch('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error();
                const data = await res.json();
                setUser(data);
                setFullName(data.full_name || '');
                setPhone(data.phone || '');
            } catch {
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMe();
    }, [navigate]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ full_name: fullName, phone })
            });
            if (!res.ok) throw new Error();
            setUser(await res.json());
            showToast("Profil muvaffaqiyatli yangilandi! ✓");
        } catch {
            showToast("Profilni yangilashda xatolik yuz berdi", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPass !== confirmPass) { showToast("Yangi parollar mos kelmaydi", 'error'); return; }
        if (newPass.length < 6) { showToast("Parol kamida 6 ta belgidan iborat bo'lishi kerak", 'error'); return; }
        setIsChangingPass(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ current_password: currentPass, new_password: newPass })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Xatolik');
            showToast("Parol muvaffaqiyatli o'zgartirildi! ✓");
            setCurrentPass(''); setNewPass(''); setConfirmPass('');
        } catch (err) {
            showToast(err.message || "Parolni o'zgartirishda xatolik", 'error');
        } finally {
            setIsChangingPass(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Activity className="w-10 h-10 text-neon-blue animate-spin" />
        </div>
    );

    const isAdmin = !!user?.is_admin;
    const displayName = user?.full_name || user?.email || '';
    const badgeLabel = isAdmin ? 'Admin' : "A'zo";
    const badgeClass = isAdmin
        ? 'text-neon-purple border-neon-purple/40 bg-neon-purple/15 shadow-[0_0_12px_rgba(176,0,255,0.25)]'
        : 'text-neon-blue border-neon-blue/20 bg-neon-blue/10';

    return (
        <div className="min-h-screen relative pb-24 pt-12">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-neon-purple/8 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-neon-blue/8 blur-[150px] rounded-full pointer-events-none" />

            <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} />}</AnimatePresence>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                {/* Back */}
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Kabinetga qaytish
                </Link>

                {/* Profile card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6 flex items-center gap-5"
                >
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.25)] shrink-0">
                        <span className="text-2xl font-black text-white">
                            {(user?.full_name || user?.email || '?')[0].toUpperCase()}
                        </span>
                    </div>

                    {/* Identity */}
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-white text-lg truncate leading-tight">{displayName}</p>
                        {user?.full_name && (
                            <p className="text-slate-400 text-sm truncate">{user.email}</p>
                        )}
                        <p className="text-slate-600 text-xs mt-0.5">
                            Ro'yxatdan o'tgan: {formatDate(user?.created_at)}
                        </p>
                    </div>

                    {/* Role badge */}
                    <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider ${badgeClass}`}>
                        <Shield className="w-3 h-3" />
                        {badgeLabel}
                    </div>
                </motion.div>

                {/* ── Tabs ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                    className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden"
                >
                    {/* Tab bar */}
                    <div className="flex border-b border-slate-800 bg-slate-950/50 relative">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => switchTab(tab.id)}
                                    className={`relative flex items-center gap-2.5 px-8 py-5 text-sm font-black transition-colors ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-neon-blue' : ''}`} />
                                    {tab.label}
                                    {/* Animated underline */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="tab-underline"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full shadow-[0_0_6px_rgba(0,240,255,0.8)]"
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab content */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' ? (
                            <motion.form
                                key="profile"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 16 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleSaveProfile}
                                className="p-8 space-y-6"
                            >
                                <div>
                                    <h3 className="font-black text-white text-base mb-1">Shaxsiy ma'lumotlar</h3>
                                    <p className="text-sm text-slate-500">Ism va telefon raqamingizni yangilang</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field
                                        label="To'liq ism"
                                        icon={User}
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        placeholder="Masalan: Alibek Yusupov"
                                    />
                                    <Field
                                        label="Telefon raqam"
                                        icon={Phone}
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="+998 90 000 00 00"
                                    />
                                </div>
                                <Field
                                    label="Elektron pochta (o'zgartirib bo'lmaydi)"
                                    icon={Mail}
                                    value={user?.email || ''}
                                    onChange={() => { }}
                                    disabled
                                />

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-7 py-3 rounded-xl bg-neon-blue text-slate-950 font-black text-sm hover:bg-neon-blue/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-60"
                                    >
                                        {isSaving
                                            ? <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                            : <Save className="w-4 h-4" />}
                                        Saqlash
                                    </button>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="security"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleChangePassword}
                                className="p-8 space-y-6"
                            >
                                <div>
                                    <h3 className="font-black text-white text-base mb-1">Parolni o'zgartirish</h3>
                                    <p className="text-sm text-slate-500">Xavfsizlik uchun kuchli parol tanlang</p>
                                </div>

                                <Field
                                    label="Joriy parol"
                                    icon={Lock}
                                    type={showCurrent ? 'text' : 'password'}
                                    value={currentPass}
                                    onChange={e => setCurrentPass(e.target.value)}
                                    placeholder="Joriy parolingizni kiriting"
                                    rightEl={
                                        <button type="button" onClick={() => setShowCurrent(p => !p)}
                                            className="text-slate-500 hover:text-slate-300 transition-colors">
                                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    }
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field
                                        label="Yangi parol"
                                        icon={Lock}
                                        type={showNew ? 'text' : 'password'}
                                        value={newPass}
                                        onChange={e => setNewPass(e.target.value)}
                                        placeholder="Kamida 6 ta belgi"
                                        rightEl={
                                            <button type="button" onClick={() => setShowNew(p => !p)}
                                                className="text-slate-500 hover:text-slate-300 transition-colors">
                                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        }
                                    />
                                    <Field
                                        label="Yangi parolni tasdiqlang"
                                        icon={Lock}
                                        type="password"
                                        value={confirmPass}
                                        onChange={e => setConfirmPass(e.target.value)}
                                        placeholder="Qayta kiriting"
                                    />
                                </div>

                                {/* Strength bar */}
                                {newPass && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1 flex-1">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${newPass.length >= i * 3
                                                        ? i <= 1 ? 'bg-red-500' : i <= 2 ? 'bg-yellow-500' : i <= 3 ? 'bg-neon-blue' : 'bg-green-400'
                                                        : 'bg-slate-800'
                                                    }`} />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 w-16 text-right">
                                            {newPass.length < 4 ? 'Juda zaif' : newPass.length < 7 ? 'Zaif' : newPass.length < 10 ? "O'rtacha" : 'Kuchli'}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={isChangingPass || !currentPass || !newPass || !confirmPass}
                                        className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-black text-sm hover:opacity-90 transition-all shadow-[0_0_15px_rgba(176,0,255,0.3)] disabled:opacity-50"
                                    >
                                        {isChangingPass
                                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <Lock className="w-4 h-4" />}
                                        Parolni yangilash
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfileSettings;
