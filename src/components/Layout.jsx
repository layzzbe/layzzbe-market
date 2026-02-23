import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';


const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans selection:bg-neon-purple/30 pt-20">
            <Navbar />

            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
