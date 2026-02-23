import React, { useState } from 'react';
import { Lock, AlertCircle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // OAuth2 requires form encoding data, not raw JSON
            const formData = new URLSearchParams();
            formData.append('username', email); // FastAPI OAuth2 kutayotgan nomi
            formData.append('password', password);

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error("Noto'g'ri elektron pochta yoki parol");
            }

            const data = await response.json();

            // Mahalliy xotiraga (localStorage) tokenni saqlash
            localStorage.setItem('token', data.access_token);

            // Muvaffaqiyatli kirish, admin panelga yo'naltirish
            navigate('/dashboard');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-neon-pink/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl box-glow relative overflow-hidden">
                    <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-neon-pink" />
                    </div>

                    <h1 className="text-3xl font-black text-white mb-2 text-center tracking-tight">Xush Kelibsiz</h1>
                    <p className="text-slate-400 text-center mb-8">Layzzbe Market hisobingizga kiring</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Elektron pochta</label>
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-pink transition-colors"
                                placeholder="siz@mail.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Parol</label>
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-pink transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 rounded-xl text-white font-bold transition-all mt-4 flex items-center justify-center gap-2 ${isLoading
                                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                                : 'bg-neon-pink hover:bg-neon-pink/90 shadow-[0_0_15px_rgba(255,0,153,0.3)] hover:shadow-[0_0_20px_rgba(255,0,153,0.5)]'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Activity className="w-5 h-5 animate-spin" />
                                    Tekshirilmoqda...
                                </>
                            ) : (
                                "Kirish"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-400">
                        Hisobingiz yo'qmi? <span onClick={() => navigate('/register')} className="text-neon-blue cursor-pointer hover:underline">Ro'yxatdan o'ting</span>
                    </div>
                </div>
            </div>

            {/* Error Toast */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-10 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-900 border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                    >
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <p className="text-white font-bold tracking-wide">
                            {error}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Login;
