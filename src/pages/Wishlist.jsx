import React from 'react';
import { Heart, Library } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { motion } from 'framer-motion';

const Wishlist = () => {
    const { wishlist } = useWishlist();

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
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
            className="min-h-[80vh] flex flex-col items-center p-6 relative pt-16"
        >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-pink/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />

            <div className="text-center relative z-10 mb-16 max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,0,153,0.15)]">
                    <Heart className="w-8 h-8 text-neon-pink fill-neon-pink/50" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Ko'ngildagilar</h1>
                <p className="text-slate-400 text-lg">
                    Sizga yoqqan va keyinroq ko'rish uchun saqlab qo'yilgan barcha maxsulotlar.
                </p>
            </div>

            <div className="max-w-7xl mx-auto w-full relative z-10">
                {wishlist.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        {wishlist.map((product) => (
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
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-900/30 border border-slate-800/50 rounded-3xl backdrop-blur-sm max-w-2xl mx-auto"
                    >
                        <div className="w-20 h-20 mb-6 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <Library className="w-10 h-10 text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">Sevimli maxsulotlar ro'yxati bo'sh</h3>
                        <p className="text-slate-400 text-lg mb-8 max-w-md">
                            Siz hali hech qanday maxsulotni yoqtirganlar ro'yxatiga qo'shmabsiz. Katalogga qaytib, o'zingizga yoqqanlarini belgilang.
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Wishlist;
