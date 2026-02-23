import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';

const ProductCard = ({ id, title, price, tags, image, category }) => {
    const { addToCart } = useCart();
    const { toggleWishlist, isLiked } = useWishlist();
    const { formatPrice } = useCurrency();
    const navigate = useNavigate();

    const liked = isLiked(id);

    const handleAddToCart = (e) => {
        e.preventDefault(); // Prevent navigating to product details
        addToCart({ id, title, price, image, category });
    };

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        toggleWishlist({ id, title, price, image, category, techStack: tags });
    };

    return (
        <div className="group relative rounded-2xl bg-slate-900 border border-slate-800 p-1 hover:border-neon-purple transition-all duration-300 box-glow-hover overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Link to={`/product/${id}`} className="relative z-10 flex flex-col h-full bg-slate-950 rounded-xl p-5 block">
                <div className="w-full h-48 rounded-lg mb-6 flex items-center justify-center bg-slate-900 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent z-10 pointer-events-none" />
                    <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />

                    {/* Wishlist Toggle Button Overlay */}
                    <button
                        onClick={handleToggleWishlist}
                        className={`absolute top-3 right-3 z-20 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 ${liked
                            ? 'bg-neon-pink/20 border border-neon-pink/50 text-neon-pink shadow-[0_0_15px_rgba(255,0,153,0.4)]'
                            : 'bg-slate-900/50 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                    </button>
                </div>

                <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-neon-blue transition-colors line-clamp-1">{title}</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs font-medium px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 group-hover:border-neon-blue/30 transition-colors">
                                {tag}
                            </span>
                        ))}
                        {tags.length > 3 && (
                            <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                                +{tags.length - 3}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-black text-white">{formatPrice(price)}</span>
                    <button
                        onClick={handleAddToCart}
                        className="px-5 py-2.5 rounded-lg bg-slate-100 text-slate-900 font-bold hover:bg-neon-blue hover:text-slate-950 transition-colors duration-300 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] text-sm z-20 relative"
                    >
                        Savatga
                    </button>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
