import React, { useState, useMemo } from 'react';
import { Sparkles, Search, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';

const Products = () => {
    const { products } = useProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Barcha');

    // Extract unique categories dynamically
    const CATEGORIES = useMemo(() => {
        return ['Barcha', ...new Set(products.map(p => p.category))];
    }, [products]);

    // Combine filtering logic
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesCategory = selectedCategory === 'Barcha' || product.category === selectedCategory;

            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                product.title.toLowerCase().includes(searchLower) ||
                product.techStack.some(tech => tech.toLowerCase().includes(searchLower));

            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory, products]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="min-h-[80vh] flex flex-col items-center p-6 relative pt-16"
        >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-blue/10 blur-[130px] rounded-full mix-blend-screen pointer-events-none" />

            <div className="text-center relative z-10 mb-12 max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
                    <Sparkles className="w-8 h-8 text-neon-blue" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Barcha Maxsulotlar</h1>
                <p className="text-slate-400 text-lg">
                    Premium darajadagi UI shablonlar, to'liq dastur kodlari va raqamli maxsulotlar to'plami.
                </p>
            </div>

            <div className="max-w-7xl mx-auto w-full relative z-10 mb-12 space-y-8">
                {/* Search Bar */}
                <div className="max-w-2xl mx-auto relative group w-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative flex items-center bg-slate-900/80 backdrop-blur-md border border-slate-700 focus-within:border-neon-purple rounded-2xl overflow-hidden shadow-2xl transition-all h-14">
                        <div className="pl-6 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-neon-blue transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Shablonlar, kodlar va loyihalarni izlash..."
                            className="w-full bg-transparent border-none py-4 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 text-[17px]"
                        />
                    </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 backdrop-blur-sm ${selectedCategory === category
                                ? 'bg-neon-blue text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] border border-transparent'
                                : 'bg-slate-900/50 text-slate-300 border border-slate-700 hover:border-neon-purple/50 hover:bg-slate-800'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full relative z-10 min-h-[400px]">
                <AnimatePresence mode="wait">
                    {filteredProducts.length > 0 ? (
                        <motion.div
                            key="grid"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        >
                            {filteredProducts.map((product) => (
                                <motion.div key={product.id} variants={itemVariants} layout className="h-full">
                                    <ProductCard
                                        id={product.id}
                                        title={product.title}
                                        price={product.price}
                                        tags={product.techStack}
                                        image={product.image}
                                        category={product.category}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-900/30 border border-slate-800/50 rounded-3xl backdrop-blur-sm max-w-2xl mx-auto"
                        >
                            <div className="w-20 h-20 mb-6 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                <Library className="w-10 h-10 text-slate-600" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Hech narsa topilmadi</h3>
                            <p className="text-slate-400 text-lg mb-8 max-w-md">
                                Kechirasiz, qidiruvingiz bo'yicha bunday maxsulot topilmadi. Boshqa kalit so'z bilan urinib ko'ring.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('Barcha');
                                }}
                                className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 hover:border-slate-500"
                            >
                                Filtrlarni tozalash
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Products;
