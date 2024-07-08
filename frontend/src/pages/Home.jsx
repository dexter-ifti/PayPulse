import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black-100 p-4">
            <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-semibold text-orange-800 mb-6 text-center">
                PayPulse App
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 w-full max-w-4xl">

                <div className="bg-white shadow-md rounded-lg p-6 mb-6 md:mb-0 w-full max-w-md mx-auto md:mx-0">
                    <h1 className="text-2xl font-bold mb-4 text-center text-pink-950">New Here?</h1>
                    <Link to="/SignUp" className="block text-center text-blue-500 hover:underline">
                        Sign Up
                    </Link>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md mx-auto md:mx-0">
                    <h1 className="text-2xl font-bold mb-4 text-center text-red-600">Already have an account?</h1>
                    <Link to="/SignIn" className="block text-center text-blue-500 hover:underline">
                        Sign In
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Home;
