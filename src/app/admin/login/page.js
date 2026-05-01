"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminStaffLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleStaffLogin = async (e) => {
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
        // DEFENSIVE CHECK: Handle different possible response structures
        const role = data.role || data.user?.role;
        const userId = data.user?.id || data.userId || data.id;

        // NORMALIZATION: Convert to uppercase and trim spaces to prevent "Access Denied" errors
        const normalizedRole = role ? role.toString().trim().toUpperCase() : '';

        if (normalizedRole === 'DOCTOR' || normalizedRole === 'ASSISTANT' || normalizedRole === 'ADMIN') {
          if (userId) {
            localStorage.setItem('userId', userId);
            localStorage.setItem('userRole', role); // Store original case for display

            const dashboardRoutes = {
              'DOCTOR': '/admin-dashboard/doctor',
              'ASSISTANT': '/admin-dashboard/assistant',
              'ADMIN': '/admin-dashboard/admin'
            };

            router.push(dashboardRoutes[normalizedRole]);
          } else {
            alert("System Error: Staff ID not found in database response.");
          }
        } else {
          // This triggers if the role is 'Patient' or undefined
          alert(`Access Denied: Account role "${role}" is not authorized for the Staff Portal.`);
          setLoading(false);
        }
      } else {
        alert(data.message || "Invalid Staff Credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 font-manrope px-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[450px]">
        
        <div className="text-center mb-8">
          <h1 className="font-poppins text-3xl font-semibold text-slate-900 mb-2">Staff Portal</h1>
          <p className="text-slate-500 text-base">Clinical & Admin Access</p>
        </div>

        <form className="space-y-5" onSubmit={handleStaffLogin}>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Clinic Email</label>
            <input 
              type="text" 
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="staff@mednet.com" 
              className="w-full p-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full p-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-between text-sm pt-2">
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
              Remember device
            </label>
            <Link href="#" className="text-blue-600 font-bold hover:underline">Reset access?</Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="text-lg w-full py-4 bg-slate-900 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-slate-200 mt-4 active:scale-95 disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Enter Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}