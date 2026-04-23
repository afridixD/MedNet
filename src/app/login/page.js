"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';



export default function LoginPage() {

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard'); 
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 font-manrope px-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[450px]">
        
        <div className="text-center mb-8">
          <h1 className="font-poppins text-3xl font-semibold text-slate-900 mb-2">Sign In</h1>
          <p className="text-slate-500 text-base">Enter your credentials to continue</p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Email or Username</label>
            <input 
              type="text" 
              placeholder="name@example.com" 
              className="w-full p-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm pt-2">
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
              Remember me
            </label>
            <Link href="#" className="text-blue-600 font-bold hover:underline">Forgot password?</Link>
          </div>

          <button type="button" className="text-lg w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-200 mt-4">
            Sign In
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-600 font-medium">
          Don't have an account? <Link href="/register" className="text-blue-600 font-bold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}