import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center light:bg-gray-100 p-4">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center text-pink-950">New Here?</h1>
                <Link to="/SignUp" className="block text-center text-blue-500 hover:underline border-4">
                    Sign Up
                </Link>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center text-red-600">Already have an account?</h1>
                <Link to="/SignIn" className="block text-center text-blue-500 hover:underline border-4">
                    Sign In
                </Link>
            </div>
        </div>
    )
}

export default Home