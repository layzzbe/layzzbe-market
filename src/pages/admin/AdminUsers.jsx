import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, User, Trash2, Search, X, ShoppingBag, DollarSign, Calendar, CreditCard, Package, ChevronRight, Edit2, Lock, CheckCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { API_URL } from '../../utils/api';

// ─── Yordamchi funksiyalar ───────────────────────────────────────
const formatDate = (dateStr) => {
    if (!dateStr) return "Noma'lum";
    const d = new Date(dateStr);
    return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
};

const USD_TO_UZS = 12800;
const formatUZS = (usd) => {
    const uzs = Math.round(usd * USD_TO_UZS).toLocaleString('uz-UZ');
    return `${uzs} so'm`;
};

// ─── Role Edit Modal ─────────────────────────────────────────────
const ROLES = [
    { value: 'admin', label: 'Admin', color: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'border-neon-pink/30', desc: "Barcha tizimga to'liq kirish" },
    { value: 'moderator', label: 'Moderator', color: 'text-neon-purple', bg: 'bg-neon-purple/10', border: 'border-neon-purple/30', desc: "Mahsulotlar va izohlarni boshqarish" },
    { value: 'user', label: "Oddiy a'zo", color: 'text-neon-blue', bg: 'bg-neon-blue/10', border: 'border-neon-blue/20', desc: "Standart foydalanuvchi huquqlari" },
];

const RoleEditModal = ({ userItem, onClose, onUpdate }) => {
    const [selectedRole, setSelectedRole] = useState(userItem.role || 'user');
    const [newPassword, setNewPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const token = localStorage.getItem('token');
        let success = true;

        // Rolni yangilash
        try {
            const res = await fetch(`${API_URL}/api/users/${userItem.id}/role-update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ role: selectedRole })
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
        } catch (e) {
            showToast(e.message || "Rolni yangilashda xatolik", 'error');
            success = false;
        }

        // Parolni tiklash (agar kiritilgan bo'lsa)
        if (success && newPassword.trim().length > 0) {
            if (newPassword.length < 6) {
                showToast("Parol kamida 6 ta belgidan iborat bo'lishi kerak", 'error');
                setIsSaving(false);
                return;
            }
            try {
                const res = await fetch(`${API_URL}/api/users/${userItem.id}/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ new_password: newPassword })
                });
                if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
            } catch (e) {
                showToast(e.message || "Parolni tiklashda xatolik", 'error');
                success = false;
            }
        }

        setIsSaving(false);
        if (success) {
            onUpdate(userItem.id, selectedRole, selectedRole === 'admin');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 20 }} transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                className="relative w-full max-w-md bg-slate-900 border border-neon-purple/30 rounded-3xl shadow-[0_0_50px_rgba(176,0,255,0.2)] overflow-hidden"
            >
                {/* Glow */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-neon-purple/15 rounded-full blur-[60px] pointer-events-none" />

                {/* Header */}
                <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-neon-purple/15 border border-neon-purple/30 flex items-center justify-center">
                            <Edit2 className="w-4 h-4 text-neon-purple" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-black text-neon-purple">Rol va parol boshqaruvi</p>
                            <p className="text-sm font-bold text-white truncate max-w-[220px]">{userItem.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 space-y-5 relative z-10">
                    {toast && (
                        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
                            }`}>
                            <CheckCircle className="w-4 h-4 shrink-0" />{toast.msg}
                        </div>
                    )}

                    {/* Rol tanlash */}
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Yangi rol tanlang</p>
                        <div className="space-y-2">
                            {ROLES.map(r => (
                                <button key={r.value} onClick={() => setSelectedRole(r.value)}
                                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${selectedRole === r.value
                                        ? `${r.bg} ${r.border} shadow-[0_0_12px_rgba(0,0,0,0.3)]`
                                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedRole === r.value ? r.border.replace('border-', 'border-') + ' ' + r.color.replace('text-', 'bg-') : 'border-slate-700'
                                        }`}>
                                        {selectedRole === r.value && <div className="w-2 h-2 rounded-full bg-current" />}
                                    </div>
                                    <div>
                                        <p className={`font-black text-sm ${selectedRole === r.value ? r.color : 'text-slate-300'}`}>{r.label}</p>
                                        <p className="text-xs text-slate-500">{r.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Parolni tiklash */}
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Parolni tiklash (ixtiyoriy)</p>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="password"
                                placeholder="Yangi parol (bo'sh qoldirsa o'zgarmaydi)"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-neon-purple/50 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-1">
                        <button onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold text-sm hover:bg-slate-800 hover:text-white transition-colors">
                            Bekor qilish
                        </button>
                        <button onClick={handleSave} disabled={isSaving}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-black text-sm hover:opacity-90 transition-all shadow-[0_0_15px_rgba(176,0,255,0.25)] disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Saqlash
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
const UserDetailModal = ({ userId, currentUser, onClose }) => {
    const [detail, setDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/users/${userId}/detail`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) setDetail(await res.json());
            } catch (e) {
                console.error("Detail xatosi:", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [userId]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="relative w-full max-w-2xl max-h-[88vh] flex flex-col bg-slate-900 border border-neon-purple/30 rounded-3xl shadow-[0_0_60px_rgba(176,0,255,0.25)] overflow-hidden"
            >
                {/* Glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-neon-purple/15 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-neon-blue/10 rounded-full blur-[80px] pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-[0_0_20px_rgba(176,0,255,0.4)]">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-widest font-black text-neon-purple mb-0.5">Foydalanuvchi profili</p>
                            <h2 className="text-lg font-black text-white truncate max-w-xs">{detail?.email ?? '...'}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
                    </div>
                ) : detail ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                        {/* Stats strip */}
                        <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800">
                            {[
                                { label: "Ro'yxat sanasi", value: formatDate(detail.created_at), icon: Calendar, color: "text-neon-blue" },
                                { label: "Jami xaridlar", value: `${detail.orders_count} ta`, icon: ShoppingBag, color: "text-neon-purple" },
                                { label: "Umumiy summasi", value: `$${detail.total_spent_usd}`, icon: DollarSign, color: "text-green-400" },
                            ].map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <div key={i} className="p-5 flex flex-col items-center text-center gap-2 bg-slate-950/30">
                                        <Icon className={`w-5 h-5 ${s.color}`} />
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
                                        <p className={`font-black text-base ${s.color}`}>{s.value}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* UZS total */}
                        <div className="mx-6 mt-5 p-4 rounded-2xl bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 border border-neon-purple/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-neon-pink" />
                                <span className="text-sm font-bold text-slate-300">UZS da umumiy xaridlar:</span>
                            </div>
                            <span className="font-black text-neon-pink text-lg">{formatUZS(detail.total_spent_usd)}</span>
                        </div>

                        {/* Role badge */}
                        <div className="mx-6 mt-4 flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-500 uppercase">Daraja:</span>
                            {detail.is_admin ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-xs font-black uppercase tracking-wider">
                                    <Shield className="w-3 h-3" /> Admin
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-xs font-black uppercase tracking-wider">
                                    <User className="w-3 h-3" /> Foydalanuvchi
                                </span>
                            )}
                        </div>

                        {/* Order history */}
                        <div className="p-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Package className="w-4 h-4 text-neon-blue" />
                                Xaridlar tarixi
                            </h3>

                            {detail.orders.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl">
                                    <ShoppingBag className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-500 font-bold">Hali hech qanday xarid yo'q</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {detail.orders.map((order) => (
                                        <motion.div
                                            key={order.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-neon-purple/30 transition-colors group"
                                        >
                                            {order.product_image ? (
                                                <img src={order.product_image} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                                                    <Package className="w-5 h-5 text-slate-600" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-white truncate">{order.product_title || "Noma'lum mahsulot"}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{formatDate(order.created_at)}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-black text-green-400">${order.amount_usd}</p>
                                                <p className="text-xs text-slate-600">{formatUZS(order.amount_usd)}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center py-20 text-slate-500 font-bold">
                        Ma'lumot topilmadi
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminUsers = () => {
    const { user } = useOutletContext();
    const [usersList, setUsersList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await fetch(`${API_URL}/api/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) setUsersList(await response.json());
            } catch (error) {
                console.error("Foydalanuvchilarni yuklashda xato:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() =>
        usersList.filter(u =>
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        ), [usersList, searchTerm]);

    const toggleRole = async (userItem) => {
        if (userItem.id === user?.id) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/users/${userItem.id}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ is_admin: !userItem.is_admin })
            });
            if (res.ok) {
                const updated = await res.json();
                setUsersList(prev => prev.map(u => u.id === updated.id ? { ...u, is_admin: updated.is_admin } : u));
            }
        } catch (e) { console.error(e); }
    };

    const deleteUser = async (userId) => {
        if (userId === user?.id) return;
        if (!window.confirm("Foydalanuvchini rostdan ham o'chirmoqchimisiz?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setUsersList(prev => prev.filter(u => u.id !== userId));
        } catch (e) { console.error(e); }
    };

    return (
        <div className="w-full h-full max-w-7xl mx-auto flex flex-col relative">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Foydalanuvchilar</h1>
                    <p className="text-slate-400 text-base">Tizimda ro'yxatdan o'tgan barcha a'zolarni boshqaring</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                    <Users className="w-5 h-5 text-neon-blue" />
                    <span className="font-bold">Jami: <span className="text-neon-blue">{usersList.length}</span></span>
                </div>
            </motion.div>

            {/* Search bar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="mb-4 relative group"
            >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-neon-blue transition-colors" />
                <input
                    type="text"
                    placeholder="Email bo'yicha foydalanuvchi qidirish..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_15px_rgba(0,240,255,0.08)] transition-all font-medium"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </motion.div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col overflow-hidden"
            >
                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-widest font-bold">
                                <th className="p-5 w-14">#</th>
                                <th className="p-5">Email</th>
                                <th className="p-5 text-center">Rol</th>
                                <th className="p-5 text-center">Ro'yxat sanasi</th>
                                <th className="p-5 text-center">Xaridlar</th>
                                <th className="p-5 text-center">Sarflagan</th>
                                <th className="p-5 text-right">Harakatlar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="7" className="p-16 text-center">
                                    <div className="w-8 h-8 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin mx-auto mb-3" />
                                    <p className="text-slate-500 font-bold text-sm">Yuklanmoqda...</p>
                                </td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="7" className="p-16 text-center">
                                    <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-500 font-bold">Foydalanuvchi topilmadi</p>
                                </td></tr>
                            ) : (
                                filteredUsers.map((userItem, idx) => (
                                    <motion.tr
                                        key={userItem.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.04 }}
                                        className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group"
                                    >
                                        {/* ID */}
                                        <td className="p-5 text-slate-600 font-mono text-sm">{userItem.id}</td>

                                        {/* Email — clickable */}
                                        <td className="p-5">
                                            <button
                                                onClick={() => setSelectedUserId(userItem.id)}
                                                className="flex items-center gap-2 font-bold text-slate-200 hover:text-neon-blue transition-colors group/email"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 border border-neon-purple/20 flex items-center justify-center shrink-0">
                                                    <span className="text-xs font-black text-white">{userItem.email[0].toUpperCase()}</span>
                                                </div>
                                                <span className="truncate max-w-[200px]">{userItem.email}</span>
                                                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover/email:text-neon-blue group-hover/email:translate-x-0.5 transition-all opacity-0 group-hover/email:opacity-100" />
                                            </button>
                                        </td>

                                        {/* Rol */}
                                        <td className="p-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {userItem.is_admin ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neon-pink/10 border border-neon-pink/20 text-neon-pink text-xs font-bold uppercase tracking-wider shadow-[0_0_8px_rgba(255,0,153,0.15)]">
                                                        <Shield className="w-3 h-3" /> Admin
                                                    </span>
                                                ) : userItem.role === 'moderator' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-xs font-bold uppercase tracking-wider">
                                                        <Shield className="w-3 h-3" /> Moderator
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                                        <User className="w-3 h-3" /> A'zo
                                                    </span>
                                                )}
                                                {userItem.id !== user?.id && (
                                                    <button
                                                        onClick={() => setEditingUser(userItem)}
                                                        className="p-1.5 rounded-lg text-slate-600 hover:text-neon-purple hover:bg-neon-purple/10 transition-colors"
                                                        title="Rolni tahrirlash"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>

                                        {/* Sana */}
                                        <td className="p-5 text-center">
                                            <span className="text-slate-400 text-sm font-medium">{formatDate(userItem.created_at)}</span>
                                        </td>

                                        {/* Xaridlar soni */}
                                        <td className="p-5 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-black ${userItem.orders_count > 0 ? 'text-neon-blue bg-neon-blue/10 border border-neon-blue/20' : 'text-slate-600 bg-slate-800/50 border border-transparent'}`}>
                                                <ShoppingBag className="w-3.5 h-3.5" />
                                                {userItem.orders_count ?? 0}
                                            </span>
                                        </td>

                                        {/* Sarflagan */}
                                        <td className="p-5 text-center">
                                            <div>
                                                <p className={`font-black text-sm ${(userItem.total_spent_usd ?? 0) > 0 ? 'text-green-400' : 'text-slate-600'}`}>
                                                    ${userItem.total_spent_usd ?? 0}
                                                </p>
                                                {(userItem.total_spent_usd ?? 0) > 0 && (
                                                    <p className="text-[10px] text-slate-600 mt-0.5">{formatUZS(userItem.total_spent_usd)}</p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Harakatlar */}
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => toggleRole(userItem)}
                                                    disabled={userItem.id === user?.id}
                                                    title={userItem.id === user?.id ? "O'z darajangizni o'zgartira olmaysiz" : "Darajani almashtirish"}
                                                    className={`p-2 rounded-lg transition-all border text-xs font-bold ${userItem.id === user?.id ? 'bg-slate-800/40 text-slate-700 border-transparent cursor-not-allowed' : 'bg-slate-800 text-neon-purple hover:bg-neon-purple/15 border-transparent hover:border-neon-purple/30'}`}
                                                >
                                                    <Shield className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(userItem.id)}
                                                    disabled={userItem.id === user?.id}
                                                    title={userItem.id === user?.id ? "O'zingizni o'chira olmaysiz" : "O'chirish"}
                                                    className={`p-2 rounded-lg transition-all border ${userItem.id === user?.id ? 'bg-slate-800/40 text-slate-700 border-transparent cursor-not-allowed' : 'bg-slate-800 text-red-400 hover:bg-red-500/15 border-transparent hover:border-red-500/30'}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Role Edit Modal */}
            <AnimatePresence>
                {editingUser && (
                    <RoleEditModal
                        userItem={editingUser}
                        onClose={() => setEditingUser(null)}
                        onUpdate={(id, role, isAdmin) => {
                            setUsersList(prev => prev.map(u => u.id === id ? { ...u, role, is_admin: isAdmin } : u));
                        }}
                    />
                )}
            </AnimatePresence>

            {/* User detail modal */}
            <AnimatePresence>
                {selectedUserId && (
                    <UserDetailModal
                        userId={selectedUserId}
                        currentUser={user}
                        onClose={() => setSelectedUserId(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsers;
