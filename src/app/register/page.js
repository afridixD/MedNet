"use client"; // Required for interactivity
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/register/onboarding?userId=${data.userId}`);
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 font-manrope px-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[450px] animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <h1 className="font-poppins text-3xl font-semibold text-slate-900 mb-2 tracking-tight">Create Account</h1>
          <p className="text-slate-500 text-base">Join the Healthcare platform today</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          
          <InputGroup 
            label="Full Name" 
            type="text" 
            value={formData.fullName} 
            onChange={(v) => setFormData({...formData, fullName: v})} 
          />
          
          <InputGroup 
            label="Username" 
            type="text" 
            value={formData.username} 
            onChange={(v) => setFormData({...formData, username: v})} 
          />
          
          <InputGroup 
            label="Email" 
            type="email" 
            value={formData.email} 
            onChange={(v) => setFormData({...formData, email: v})} 
          />
          
          <InputGroup 
            label="Password" 
            type="password" 
            value={formData.password} 
            onChange={(v) => setFormData({...formData, password: v})} 
          />

          <button 
            type="submit" 
            disabled={loading}
            className="text-lg w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-200 mt-4 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-600 font-medium">
          Already have an account? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

function InputGroup({ label, type, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">{label}</label>
      <input 
        required
        type={type} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
      />
    </div>
  );
}