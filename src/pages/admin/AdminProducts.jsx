import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Filter, X, Save, AlertCircle } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useCurrency } from '../../context/CurrencyContext';
import { API_URL } from '../../utils/api';

const AdminProducts = () => {
    // Profilni Layout.jsx orqali olish va global maxsulotlar
    const { user } = useOutletContext();
    const { products, setProducts } = useProducts();
    const { formatPrice, currency } = useCurrency();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState('newest');
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState("");

    // Obyekt strukturasi form uchun
    const [formData, setFormData] = useState({
        id: null,
        title: '',
        description: '',
        price: '',
        image: '',
        category: '',
        techStack: '',
        features: ''
    });

    const openCreateModal = () => {
        setIsEditing(false);
        setFormData({
            id: null,
            title: '',
            description: '',
            price: '',
            image: '',
            category: 'Web Dasturlash',
            techStack: '',
            features: ''
        });
        setFormError("");
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setIsEditing(true);
        setFormData({
            id: product.id,
            title: product.title,
            description: product.description,
            price: String(product.price).replace(/[^0-9.]/g, ''), // faqat raqamlarni olamiz tahrirlash qulayligi ushun
            image: product.image,
            category: product.category,
            techStack: Array.isArray(product.techStack) ? product.techStack.join(', ') : product.techStack,
            features: Array.isArray(product.features) ? product.features.join(', ') : product.features
        });
        setFormError("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!formData.title || !formData.price || !formData.image) {
            setFormError("Iltimos, barcha majburiy maydonlarni to'ldiring.");
            return;
        }

        setIsSaving(true);

        const payload = {
            title: formData.title,
            description: formData.description,
            price: `$${formData.price}`, // Backend narxni String Dollar bilan kutadi
            image: formData.image,
            category: formData.category,
            techStack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean),
            features: formData.features.split(',').map(s => s.trim()).filter(Boolean)
        };

        try {
            const token = localStorage.getItem('token');
            const url = isEditing
                ? `/api/products/${formData.id}`
                : '/api/products';

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(`${API_URL}${url}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Xatolik yuz berdi");
            }

            const savedProduct = await response.json();

            // Ui Context ni yangilaymiz
            if (isEditing) {
                setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
            } else {
                setProducts(prev => [...prev, savedProduct]);
            }

            closeModal();
        } catch (error) {
            console.error("Save error:", error);
            setFormError("Ma'lumotlarni saqlashda tarmoq xatosi yuz berdi.");
        } finally {
            setIsSaving(false);
        }
    };

    // O'chirish logikasi
    const handleDelete = async (productId) => {
        const confirmDelete = window.confirm("Rostdan ham ushbu maxsulotni o'chirmoqchimisiz?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
            } else {
                console.error("O'chirishda xatolik yuz berdi");
                alert("Mahsulotni o'chirishda xatolik yuz berdi.");
            }
        } catch (error) {
            console.error("Tarmoq xatosi:", error);
        }
    };

    // Qidiruv va Saralash tizimi
    const filteredProducts = (products || [])
        .filter(product => {
            const matchTitle = product?.title?.toLowerCase()?.includes(searchTerm.toLowerCase());
            const matchCategory = product?.category?.toLowerCase()?.includes(searchTerm.toLowerCase());
            return matchTitle || matchCategory;
        })
        .sort((a, b) => {
            const priceA = parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
            const priceB = parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;

            if (sortBy === 'price-desc') return priceB - priceA;
            if (sortBy === 'price-asc') return priceA - priceB;
            // newest (default bo'yicha id bo'yicha oxirgilar tepadaroq)
            return b.id - a.id;
        });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="w-full h-full max-w-7xl mx-auto flex flex-col relative">
            {/* Header Area */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Maxsulotlar</h1>
                    <p className="text-slate-400 text-lg">Platformadagi barcha kurslar va raqamli tovarlar ro'yxati</p>
                </div>

                {/* Yaratish tugmasi */}
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-neon-blue px-6 py-3 rounded-xl font-bold text-slate-950 hover:bg-neon-blue/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] text-glow whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" />
                    Yangi maxsulot qo'shish
                </button>
            </motion.div>

            {/* Qidiruv paneli va Table Wrapper */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col overflow-hidden"
            >
                {/* Tools Header */}
                <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-4 justify-between bg-slate-950/30">
                    <div className="relative w-full sm:max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-neon-blue transition-colors" />
                        <input
                            type="text"
                            placeholder="Nomi yoki kategoriya bo'yicha qidiruv..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-300 focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all font-medium"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors bg-slate-950"
                        >
                            <Filter className="w-4 h-4" />
                            <span className="font-bold text-sm">Saralash</span>
                        </button>

                        <AnimatePresence>
                            {isSortOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.6)] overflow-hidden z-20"
                                >
                                    <button
                                        onClick={() => { setSortBy('newest'); setIsSortOpen(false); }}
                                        className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${sortBy === 'newest' ? 'bg-neon-blue/10 text-neon-blue' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                                    >
                                        Yangi qo'shilganlar
                                    </button>
                                    <button
                                        onClick={() => { setSortBy('price-desc'); setIsSortOpen(false); }}
                                        className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${sortBy === 'price-desc' ? 'bg-neon-blue/10 text-neon-blue' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                                    >
                                        Narx (Qimmatidan)
                                    </button>
                                    <button
                                        onClick={() => { setSortBy('price-asc'); setIsSortOpen(false); }}
                                        className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${sortBy === 'price-asc' ? 'bg-neon-blue/10 text-neon-blue' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                                    >
                                        Narx (Arzonidan)
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Data Table */}
                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-widest font-bold">
                                <th className="p-5 font-bold">Rasm</th>
                                <th className="p-5 font-bold">Nomi</th>
                                <th className="p-5 font-bold">Kategoriya</th>
                                <th className="p-5 font-bold">Narxi</th>
                                <th className="p-5 font-bold text-right">Harakatlar</th>
                            </tr>
                        </thead>
                        <motion.tbody
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="bg-transparent"
                        >
                            {filteredProducts.map((product) => (
                                <motion.tr
                                    key={product.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                                >
                                    <td className="p-5 w-24">
                                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                                            <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="font-black text-white text-base max-w-xs truncate">{product.title}</div>
                                        <div className="text-sm font-bold text-slate-500 mt-1 max-w-xs truncate">{product.description}</div>
                                    </td>
                                    <td className="p-5">
                                        <span className="px-3 py-1 rounded-md bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-xs font-bold uppercase tracking-wider">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <span className="font-black text-white">{formatPrice(product.price)}</span>
                                    </td>
                                    <td className="p-5 text-right w-36">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="p-2 rounded-lg bg-slate-800 text-neon-blue hover:bg-neon-blue/20 transition-colors border border-transparent hover:border-neon-blue/30"
                                                title="Tahrirlash"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 rounded-lg bg-slate-800 text-red-400 hover:bg-red-500/20 transition-colors border border-transparent hover:border-red-500/30"
                                                title="O'chirish"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}

                            {filteredProducts?.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-500 font-bold">
                                        Hozircha tizimda maxsulotlar mavjud emas yoki qidiruv natija bermadi.
                                    </td>
                                </tr>
                            )}
                        </motion.tbody>
                    </table>
                </div>
            </motion.div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={closeModal}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                                <h2 className="text-2xl font-black text-white tracking-tight text-glow">
                                    {isEditing ? "Maxsulotni tahrirlash" : "Yangi maxsulot qo'shish"}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                {formError && (
                                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                        <p className="text-red-300 text-sm font-medium">{formError}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nomi *</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleFormChange}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors"
                                                placeholder="Masalan: Next.js SaaS Loyiha"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asosiy Narxi (Har doim USD da) *</label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleFormChange}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors font-mono"
                                                placeholder="49"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kategoriya</label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleFormChange}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors appearance-none"
                                            >
                                                <option value="Web Dasturlash">Web Dasturlash</option>
                                                <option value="Mobil Dasturlash">Mobil Dasturlash</option>
                                                <option value="Boshqaruv Paneli">Boshqaruv Paneli</option>
                                                <option value="Backend">Backend</option>
                                                <option value="Sun'iy Intellekt">Sun'iy Intellekt</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rasm URL *</label>
                                            <input
                                                type="url"
                                                name="image"
                                                value={formData.image}
                                                onChange={handleFormChange}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors font-mono text-sm"
                                                placeholder="https://images.unsplash..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Qisqacha Tavsif</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleFormChange}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors h-24 max-h-48 resize-y"
                                            placeholder="Maxsulot haqida ma'lumot qoldiring..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Texnologiyalar (Vergul bilan ajrating)</label>
                                        <input
                                            type="text"
                                            name="techStack"
                                            value={formData.techStack}
                                            onChange={handleFormChange}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors text-sm"
                                            placeholder="React, Node.js, Tailwind..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Afzalliklari (Vergul bilan ajrating)</label>
                                        <textarea
                                            name="features"
                                            value={formData.features}
                                            onChange={handleFormChange}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors h-24 text-sm"
                                            placeholder="Xususiyat 1, Xususiyat 2..."
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex justify-end gap-4">
                                <button
                                    onClick={closeModal}
                                    type="button"
                                    className="px-6 py-3 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink text-white hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(255,0,153,0.4)] flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    {isEditing ? "Saqlash" : "Yaratish"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminProducts;
