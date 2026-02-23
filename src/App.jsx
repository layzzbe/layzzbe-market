import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, Zap, LogOut } from 'lucide-react';
import { useSettings } from './context/SettingsContext';
import { useUser } from './context/UserContext';

import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Dashboard from './pages/Dashboard';
import ProfileSettings from './pages/ProfileSettings';
import PaymentHistory from './pages/PaymentHistory';

import AdminLayout from './layouts/AdminLayout';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';

// ── Full-screen maintenance page ──────────────────────────────────────────────
const MaintenancePage = ({ message }) => {
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-blue/5 blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-neon-purple/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-center max-w-lg space-y-8"
      >
        <div className="flex justify-center">
          <motion.div
            animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-20 h-20 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center"
          >
            <Wrench className="w-10 h-10 text-yellow-400" />
          </motion.div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Zap className="w-5 h-5 text-neon-blue" />
          <span className="text-xl font-black text-white">Layzzbe Market</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Ta'mirlash<br /><span className="text-yellow-400">Rejimi</span>
          </h1>
          <p className="text-slate-400 leading-relaxed text-lg">
            {message || "Tez orada qaytamiz! Saytda ta'mirlash ishlari ketmoqda."}
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.4, repeat: Infinity, delay }}
              className="w-2.5 h-2.5 rounded-full bg-neon-blue"
            />
          ))}
        </div>

        {/* Logout button for trapped logged-in users */}
        {user && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            Tizimdan chiqish
          </button>
        )}

        <p className="text-xs text-slate-700">
          Administrator kirishi:{' '}
          <a href="/admin" className="text-neon-blue hover:underline">/admin</a>
        </p>
      </motion.div>
    </div>
  );
};

// ── Settings loading splash (anti-flicker) ────────────────────────────────────
const SettingsLoadingScreen = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
    <div className="w-10 h-10 border-2 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
    <p className="text-slate-500 text-sm font-bold tracking-wide">Sozlamalar yuklanmoqda...</p>
  </div>
);

// ── Root route renderer + maintenance gate ────────────────────────────────────
const PublicRoutes = () => {
  // FIX 1: Wait for settings load before rendering anything
  const { settings, loading: settingsLoading } = useSettings();

  if (settingsLoading) return <SettingsLoadingScreen />;

  const isExemptRoute =
    window.location.pathname.startsWith('/admin') ||
    window.location.pathname.startsWith('/login');
  const isMaintenanceOn = settings.maintenance_mode === 'true';

  if (isMaintenanceOn && !isExemptRoute) {
    return <MaintenancePage message={settings.maintenance_message} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="settings" element={<ProfileSettings />} />
        <Route path="payments" element={<PaymentHistory />} />
      </Route>

      {/* Admin routes — RBAC + maintenance exempt */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <PublicRoutes />
  </BrowserRouter>
);

export default App;
