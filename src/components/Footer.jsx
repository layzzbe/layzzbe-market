import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Instagram, Send, Youtube, Heart } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
    const { settings } = useSettings();

    const siteName = settings.site_name || 'Layzzbe Market';
    const year = new Date().getFullYear();

    const socials = [
        { key: 'instagram_link', icon: Instagram, label: 'Instagram', color: 'hover:text-pink-400 hover:border-pink-400/40' },
        { key: 'telegram_channel', icon: Send, label: 'Telegram', color: 'hover:text-neon-blue hover:border-neon-blue/40' },
        { key: 'youtube_link', icon: Youtube, label: 'YouTube', color: 'hover:text-red-400 hover:border-red-400/40' },
    ].filter(s => settings[s.key]);

    return (
        <footer className="relative mt-auto border-t border-white/5 bg-slate-950/90 backdrop-blur-sm">
            {/* Neon accent line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-blue/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">

                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 group w-fit">
                            <div className="w-8 h-8 rounded-lg bg-neon-blue/15 border border-neon-blue/30 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-neon-blue" />
                            </div>
                            <span className="text-lg font-black text-white group-hover:text-slate-200 transition-colors">
                                {siteName}
                            </span>
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                            Premium digital products va software yechimlari uchun ishonchli platforma.
                        </p>
                    </div>

                    {/* Quick links */}
                    <div className="space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-600">Sahifalar</p>
                        <div className="flex flex-col gap-2.5">
                            {[
                                { to: '/', label: 'Asosiy' },
                                { to: '/products', label: 'Maxsulotlar' },
                                { to: '/cart', label: 'Savatcha' },
                                { to: '/dashboard', label: 'Profil' },
                            ].map(({ to, label }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className="text-sm text-slate-500 hover:text-neon-blue transition-colors w-fit"
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Socials */}
                    <div className="space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-600">Ijtimoiy tarmoqlar</p>
                        {socials.length > 0 ? (
                            <div className="flex gap-3">
                                {socials.map(({ key, icon: Icon, label, color }) => (
                                    <a
                                        key={key}
                                        href={settings[key]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={label}
                                        className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 transition-all ${color}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-700 italic">Hali sozlanmagan</p>
                        )}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-600">
                        © {year} {siteName}. Barcha huquqlar himoyalangan.
                    </p>
                    <p className="text-xs text-slate-700 flex items-center gap-1">
                        Ishlab chiqildi <Heart className="w-3 h-3 text-neon-pink mx-0.5" /> bilan
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
