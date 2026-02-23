import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';

const Home = () => {
    const { products } = useProducts();
    const [searchFocused, setSearchFocused] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
        >
            <section className="relative pt-12 pb-20 lg:pt-28 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-neon-blue/20 blur-[130px] rounded-full mix-blend-screen pointer-events-none" />
                <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-neon-purple/20 blur-[130px] rounded-full mix-blend-screen pointer-events-none" />
                <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-neon-pink/15 blur-[130px] rounded-full mix-blend-screen pointer-events-none" />

                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wMyIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNNjAgMEwwIDYwTTAgMEw2MCA2MCIvPjwvZz48L3N2Zz4=')] bg-[length:60px_60px] opacity-20 pointer-events-none" />

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-blue/5 border border-neon-blue/30 text-neon-blue text-xs font-bold tracking-wider uppercase mb-8 shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:bg-neon-blue/10 transition-colors cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue"></span>
                        </span>
                        Yangi loyihalar qo'shildi
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.15] tracking-tight text-white drop-shadow-2xl">
                        Premium Raqamli Maxsulotlar <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-glow">
                            va Dastur Kodlari
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Loyihangiz uchun eng yuqori sifatli tayyor UI shablonlar, SaaS loyihalar va to'liq dastur kodlari.
                    </p>

                    <div className="max-w-2xl mx-auto relative group">
                        <div className={`absolute -inset-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-500 ${searchFocused ? 'opacity-80 duration-200' : ''}`}></div>
                        <div className={`relative flex items-center bg-slate-900 border ${searchFocused ? 'border-neon-purple' : 'border-slate-700'} hover:border-slate-500 rounded-2xl overflow-hidden shadow-2xl transition-all`}>
                            <div className="pl-6 flex items-center pointer-events-none">
                                <Search className={`w-5 h-5 transition-colors ${searchFocused ? 'text-neon-blue text-glow' : 'text-slate-400'}`} />
                            </div>
                            <input
                                type="text"
                                placeholder="Shablonlar, kodlar va UI to'plamlarni izlash..."
                                className="w-full bg-transparent border-none py-4 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 text-[17px]"
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                            />
                            <button className="mr-2 my-2 px-6 py-2.5 bg-white text-slate-900 font-bold rounded-xl hover:bg-neon-blue hover:text-slate-950 transition-all duration-300 transform active:scale-95 shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                Izlash
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section id="products" className="py-24 relative z-10 bg-slate-950/50">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Ommabop Maxsulotlar</h2>
                            <p className="text-slate-400 font-medium">Dasturchilar tomonidan eng ko'p tanlangan va tavsiya etilgan loyihalar.</p>
                        </div>
                        <Link to="/products" className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-neon-blue hover:text-neon-pink transition-colors">
                            Barchasini ko'rish &rarr;
                        </Link>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {products.slice(0, 3).map((product) => (
                            <motion.div key={product.id} variants={itemVariants} className="h-full">
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
                </div>
            </section>
        </motion.div>
    );
};

export default Home;
