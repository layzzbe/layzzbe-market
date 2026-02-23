import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Zap, DownloadCloud, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { products } = useProducts();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { formatPrice } = useCurrency();
    const product = products.find((p) => p.id === id);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!product) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
                <div className="text-center relative z-10 box-glow bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-10 max-w-lg shadow-2xl">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Maxsulot Topilmadi</h1>
                    <p className="text-slate-400 mb-8">Siz qidirayotgan sahifa yoki maxsulot mavjud emas.</p>
                    <Link to="/products" className="inline-flex px-6 py-3 rounded-xl bg-neon-blue text-slate-950 font-bold hover:bg-neon-blue/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                        Katalogga qaytish
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative pb-24">
            {/* Background ambiance */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neon-blue/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
                <Link to="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group font-medium">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Orqaga qaytish
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Left: Huge Glowing Image */}
                    <div className="relative group perspective">
                        <div className="absolute -inset-2 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition duration-700" />
                        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl transform transition-transform duration-700 hover:scale-[1.02]">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-60" />
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-auto aspect-[4/3] object-cover"
                            />
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex flex-col h-full justify-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold tracking-wider uppercase mb-6 w-fit">
                            <Zap className="w-3 h-3 text-neon-blue" />
                            {product.category}
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight text-glow">
                            {product.title}
                        </h1>

                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            {product.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-10">
                            {product.techStack.map(tech => (
                                <span key={tech} className="px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-700 text-sm font-semibold text-slate-200 hover:border-neon-purple hover:text-neon-purple transition-colors cursor-default backdrop-blur-sm">
                                    {tech}
                                </span>
                            ))}
                        </div>

                        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md mb-8">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20 text-neon-blue">🔥</span>
                                Asosiy Xususiyatlar
                            </h3>
                            <ul className="space-y-4">
                                {product.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-neon-purple shrink-0 mt-0.5" />
                                        <span className="text-slate-300 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 mt-auto">
                            <div className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                                {formatPrice(product.price)}
                            </div>
                            <button
                                onClick={() => addToCart(product)}
                                className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple text-white text-lg font-black hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(176,0,255,0.4)] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] text-center text-glow"
                            >
                                Hozir Xarid Qilish
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
