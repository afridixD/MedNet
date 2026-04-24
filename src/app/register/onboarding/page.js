"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Removed 'Link' from lucide-react to avoid conflicts
import { Activity, Droplets, Calendar, User, ArrowRight, Ruler, Scale } from 'lucide-react';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [loading, setLoading] = useState(false);
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
        // Only redirect after a successful database update
        router.push('/dashboard');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 font-manrope px-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[450px]">
        
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Create Profile</h1>
          <p className="text-slate-500 font-medium">Join the Healthcare platform today</p>
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

          {/* NO LINK TAG HERE. The form's onSubmit handles the redirect. */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-[#1d5eff] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Saving Profile..." : "Complete Setup"}
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
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
        {label}
      </label>
      <input 
        required 
        type={type} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-white border border-slate-200 rounded-xl p-4 font-medium text-slate-700 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all" 
      />
    </div>
  );
}

function SelectGroup({ label, options, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
        {label}
      </label>
      <select 
        required 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-white border border-slate-200 rounded-xl p-4 font-medium text-slate-700 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none appearance-none transition-all"
      >
        <option value="">Select</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}