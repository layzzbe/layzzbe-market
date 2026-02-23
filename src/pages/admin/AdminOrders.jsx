import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, RefreshCw, User, Package, Calendar, DollarSign } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const USD_TO_UZS = 12800;

const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const AdminOrders = () => {
    const { user: adminUser } = useOutletContext() || {};
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchOrders = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/admin/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setOrders(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, []);

    const filtered = orders.filter(o =>
        o.buyer_email?.toLowerCase().includes(search.toLowerCase()) ||
        o.product_title?.toLowerCase().includes(search.toLowerCase())
    );

    const totalRevenue = orders.reduce((s, o) => s + (o.amount_usd || 0), 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Buyurtmalar</h1>
                    <p className="text-slate-400 mt-1">Barcha platformadagi xaridlar</p>
                </div>
                <button onClick={fetchOrders}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-purple/10 border border-neon-purple/30 text-neon-purple font-bold hover:bg-neon-purple/20 transition-colors text-sm">
                    <RefreshCw className="w-4 h-4" /> Yangilash
                </button>
            </motion.div>

            {/* Stats row */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { label: "Jami buyurtmalar", value: orders.length, icon: ShoppingBag, color: "neon-blue" },
                    { label: "Jami tushum (USD)", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "green-400" },
                    { label: "Jami tushum (UZS)", value: `${Math.round(totalRevenue * USD_TO_UZS).toLocaleString('uz-UZ')} so'm`, icon: Package, color: "neon-purple" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`bg-slate-900 border border-${color}/20 rounded-2xl p-5 relative overflow-hidden`}>
                        <div className={`absolute -right-4 -top-4 w-20 h-20 bg-${color}/10 rounded-full blur-xl`} />
                        <Icon className={`w-5 h-5 text-${color} mb-2`} />
                        <p className={`text-[11px] font-black uppercase tracking-widest text-${color} mb-1`}>{label}</p>
                        <p className="text-xl font-black text-white">{value}</p>
                    </div>
                ))}
            </motion.div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Email yoki mahsulot bo'yicha qidiring..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-colors text-sm"
                />
            </div>

            {/* Table */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-950/60">
                                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">#ID</th>
                                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Xaridor</th>
                                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Mahsulot</th>
                                <th className="text-right px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Narx</th>
                                <th className="text-right px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Sana</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {isLoading ? (
                                <tr><td colSpan={5} className="py-16 text-center text-slate-500">
                                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-neon-blue" />
                                    Yuklanmoqda...
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="py-16 text-center">
                                    <ShoppingBag className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-500 font-bold">{search ? "Hech narsa topilmadi" : "Hali buyurtmalar yo'q"}</p>
                                </td></tr>
                            ) : filtered.map((order, i) => (
                                <motion.tr key={order.id}
                                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.03 } }}
                                    className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-mono text-neon-blue font-bold">#{order.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center shrink-0">
                                                <User className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <span className="text-slate-300 font-medium truncate max-w-[180px]">{order.buyer_email || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {order.product_image && (
                                                <img src={order.product_image} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-700" />
                                            )}
                                            <span className="text-white font-bold truncate max-w-[200px]">{order.product_title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-black text-green-400">${(order.amount_usd || 0).toFixed(2)}</span>
                                        <p className="text-[11px] text-slate-500">{Math.round((order.amount_usd || 0) * USD_TO_UZS).toLocaleString('uz-UZ')} so'm</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-slate-500 text-xs">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(order.created_at)}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length > 0 && (
                    <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-500 font-bold">
                        Jami {filtered.length} ta buyurtma ko'rsatilmoqda
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AdminOrders;
