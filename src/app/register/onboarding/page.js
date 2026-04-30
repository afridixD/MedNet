"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react'; // Added for the Thank You state

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Track if setup is complete
  const [formData, setFormData] = useState({
    height: '', weight: '', dob: '', bloodGroup: '', gender: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/register/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...formData }),
      });

      if (res.ok) {
        // Show the Thank You state
        setIsSuccess(true);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save health profile.");
      }
    } catch (err) {
      console.error("Onboarding error:", err);
      alert("Connection error. Is your server running?");
    } finally {
      setLoading(false);
    }
  };

  // --- THANK YOU STATE ---
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 font-manrope px-4">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-[450px] text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Setup Complete!</h1>
          <p className="text-slate-500 font-bold leading-relaxed">
            Thank you for creating your account. <br />
            We are redirecting you to the <span className="text-blue-600">Login page</span> to access your dashboard safely.
          </p>
          <div className="mt-8 flex justify-center">
             <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // --- FORM STATE ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 font-manrope px-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[450px]">
        
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Create Profile</h1>
          <p className="text-slate-500 font-medium">Final step to set up your health records</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <InputGroup 
              label="Height (cm)" 
              type="number" 
              onChange={(v) => setFormData({...formData, height: v})} 
            />
            <InputGroup 
              label="Weight (kg)" 
              type="number" 
              onChange={(v) => setFormData({...formData, weight: v})} 
            />
          </div>

          <InputGroup 
            label="Birthdate" 
            type="date" 
            onChange={(v) => setFormData({...formData, dob: v})} 
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectGroup 
              label="Blood Group" 
              options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} 
              onChange={(v) => setFormData({...formData, bloodGroup: v})} 
            />
            <SelectGroup 
              label="Gender" 
              options={['Male', 'Female', 'Other']} 
              onChange={(v) => setFormData({...formData, gender: v})} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-[#1d5eff] text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-slate-900 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Saving Profile..." : "Complete & Continue"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default function Onboarding() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center font-bold text-blue-600">Loading MedNet Profile...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}

// --- HELPER COMPONENTS ---

function InputGroup({ label, type, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
        {label}
      </label>
      <input 
        required 
        type={type} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
      />
    </div>
  );
}

function SelectGroup({ label, options, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
        {label}
      </label>
      <select 
        required 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none appearance-none transition-all cursor-pointer"
      >
        <option value="">Select</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}