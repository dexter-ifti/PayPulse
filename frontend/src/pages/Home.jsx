import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    // Note: Authentication is now handled via httpOnly cookies
    // Route protection is handled by backend session validation
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
            <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center font-bold text-xl">
                        P
                    </div>
                    <span className="text-2xl font-bold">PayPulse</span>
                </div>
                <div className="flex gap-4">
                    <Link to="/signin" className="px-6 py-2 text-gray-300 hover:text-white transition-colors duration-300">
                        Sign In
                    </Link>
                    <Link to="/signup" className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                        Get Started
                    </Link>
                </div>
            </nav>

            <main className="container mx-auto px-6 pt-20 pb-32">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent animate-gradient">
                        Send Money Instantly
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
                        Fast, secure, and seamless money transfers at your fingertips.
                        Join thousands who trust PayPulse for their daily transactions.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link to="/signup" className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-orange-500/50 w-64">
                            <span className="relative z-10">Create Account</span>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
                        </Link>
                        <Link to="/signin" className="px-8 py-4 bg-slate-700/50 backdrop-blur-sm rounded-xl text-lg font-semibold hover:bg-slate-600/50 transition-all duration-300 border border-slate-600 hover:border-slate-500 w-64">
                            Sign In
                        </Link>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-24">
                    <div className="group bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:transform hover:scale-105">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Instant Transfers</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Send money to anyone instantly. No delays, no hassle. Your transactions complete in seconds.
                        </p>
                    </div>

                    <div className="group bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:transform hover:scale-105">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Bank-Level Security</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Your money and data are protected with enterprise-grade encryption and security protocols.
                        </p>
                    </div>

                    <div className="group bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:transform hover:scale-105">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Easy to Use</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Simple, intuitive interface designed for everyone. Start sending money in minutes.
                        </p>
                    </div>
                </div>

                <div className="mt-32 text-center">
                    <div className="inline-block bg-slate-800/30 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-700 mb-8">
                        <span className="text-orange-400 font-semibold">Trusted by thousands of users</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to get started?</h2>
                    <p className="text-xl text-gray-400 mb-10">Join PayPulse today and experience hassle-free money transfers.</p>
                    <Link to="/signup" className="inline-block px-10 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-2xl">
                        Create Your Free Account
                    </Link>
                </div>
            </main>

            <footer className="border-t border-slate-800 py-8 mt-20">
                <div className="container mx-auto px-6 text-center text-gray-400">
                    <p>&copy; 2026 PayPulse. All rights reserved.</p>
                </div>
            </footer>

            <style jsx>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </div>
    );
}

export default Home;

