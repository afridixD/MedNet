"use client";
import { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, FileText, CreditCard, LogOut, Plus, Activity, Droplets, Clock, Wallet, Settings, X, User, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // 1. Extract the userId from the actual browser URL
      const params = new URLSearchParams(window.location.search);
      const userId = params.get('userId') || 1; // Default to 1 if you just visit /dashboard

      console.log("Fetching data for User ID:", userId); // Check your browser console for this!

      try {
        const [appRes, profRes] = await Promise.all([
          fetch(`/api/appointments?userId=${userId}`),
          fetch(`/api/profile?userId=${userId}`)
        ]);
        
        const appData = await appRes.json();
        const profData = await profRes.json();

        // 2. Verify the data in the console
        console.log("Profile Data Received:", profData);

        setAppointments(Array.isArray(appData) ? appData : []);
        setProfile(profData);
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // AUTO-CALCULATION LOGIC
  const calculateAge = (dob) => {
    if (!dob || dob === "0000-00-00") return "N/A";
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return "N/A";
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs); 
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const calculateBMI = (w, h) => {
    if (!w || !h || w === 0 || h === 0) return "N/A";
    const heightInMeters = h / 100;
    return (w / (heightInMeters * heightInMeters)).toFixed(1);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-blue-600 font-black">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 font-poppins"></div>
        Syncing with Database...
      </div>
    );
  }

  const bmi = calculateBMI(profile?.weight, profile?.height);
  const age = calculateAge(profile?.dob);


  // --- ADD THESE AT THE VERY BOTTOM OF page.js ---

function NavItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-200 ${
        active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-105' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{value}</h3>
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-slate-500 font-bold">{label}</span>
      <span className="text-slate-900 font-black">{value}</span>
    </div>
  );
}

function AppointmentsTable({ data }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data && data.length > 0 ? data.map((appt) => (
            <tr key={appt.appointment_id} className="hover:bg-slate-50 transition-colors cursor-pointer">
              <td className="p-6 font-bold text-slate-900">{appt.doctor_name || "Unknown"}</td>
              <td className="p-6 text-slate-600 font-medium">{appt.specialization || "N/A"}</td>
              <td className="p-6 text-slate-500 font-medium">
                {appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString() : "N/A"}
              </td>
              <td className="p-6">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                  appt.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {appt.status || "Pending"}
                </span>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" className="p-20 text-center text-slate-400 font-bold italic">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
// --- MISSING HELPERS START ---

function SettingsView({ profile, setProfile }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 max-w-4xl shadow-sm animate-in fade-in duration-500 font-manrope">
      <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
          <Settings size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Profile Settings</h3>
          <p className="text-slate-500 font-medium">Manage your personal and health information.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InputGroup label="Full Name" value={profile?.name || ""} />
        <InputGroup label="Email Address" value={profile?.email || ""} />
        <InputGroup label="Phone Number" value={profile?.phone || "Not Set"} />
        <InputGroup label="Date of Birth" type="date" value={profile?.dob ? new Date(profile.dob).toISOString().split('T')[0] : ""} />
        <InputGroup label="Weight (kg)" type="number" value={profile?.weight || ""} />
        <InputGroup label="Height (cm)" type="number" value={profile?.height || ""} />
      </div>

      <div className="mt-12 flex justify-end">
        <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 active:scale-95">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function InputGroup({ label, value, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">
        {label}
      </label>
      <input 
        type={type} 
        defaultValue={value} 
        className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
      />
    </div>
  );
}

  return (
    <div className="flex min-h-screen bg-slate-50 font-manrope">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-8">
          <h2 className="text-3xl font-black text-blue-600 tracking-tighter">MedNet</h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={20}/>} label="Overview" />
          <NavItem active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} icon={<Calendar size={20}/>} label="Appointments" />
          <NavItem active={activeTab === 'prescriptions'} onClick={() => setActiveTab('prescriptions')} icon={<FileText size={20}/>} label="Prescriptions" />
          <NavItem active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={<CreditCard size={20}/>} label="Billing" />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20}/>} label="Settings" />
        </nav>

        <div className="p-6 border-t border-slate-100">
          <Link href="/login" className="flex items-center gap-3 text-slate-500 font-bold hover:text-red-500 transition-colors px-4 py-2">
            <LogOut size={20}/> Sign Out
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-72 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter capitalize">
              {activeTab === 'overview' ? 'Health Overview' : activeTab}
            </h1>
            <p className="text-slate-500 font-medium">Account ID: <span className="text-blue-600 font-bold">#DB-{profile?.userId || "000"}</span></p>
          </div>
          <button 
            onClick={() => setIsBookingOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-200 transition-all active:scale-95 group"
          >
            <Plus size={22} className="group-hover:rotate-90 transition-transform"/> Book New Appointment
          </button>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="Total Visits" value={appointments.length} icon={<Activity className="text-blue-500"/>} />
              <StatCard label="Blood Group" value={profile?.bloodGroup || "N/A"} icon={<Droplets className="text-red-500"/>} />
              <StatCard label="Age" value={age === "N/A" ? "N/A" : `${age} Yrs`} icon={<User className="text-green-500"/>} />
              <StatCard label="BMI Status" value={bmi === "N/A" ? "N/A" : (bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : "Overweight")} icon={<Activity className="text-amber-500"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Recent Activity</h3>
                <AppointmentsTable data={appointments.slice(0, 4)} />
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Patient Profile</h3>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                   <div className="space-y-4 font-bold">
                      <ProfileItem label="Name" value={profile?.name ? `${profile.name}` : "N/A"} />
                      <ProfileItem label="Weight" value={profile?.weight ? `${profile.weight} kg` : "N/A"} />
                      <ProfileItem label="Height" value={profile?.height ? `${profile.height} cm` : "N/A"} />
                      <ProfileItem label="BMI Index" value={bmi} />
                      <ProfileItem label="Gender" value={profile?.gender || "N/A"} />
                      <ProfileItem label="Date of Birth" value={profile?.dob ? new Date(profile.dob).toLocaleDateString() : "N/A"} />
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && <AppointmentsTable data={appointments} />}
        {activeTab === 'settings' && <SettingsView profile={profile} setProfile={setProfile} />}
      </main>

      {/* MODAL PLACEHOLDER */}
      {isBookingOpen && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"><div className="bg-white p-10 rounded-3xl">Booking form logic goes here. <button onClick={()=>setIsBookingOpen(false)}>Close</button></div></div>}
    </div>
  );
}

// Sub-components (NavItem, StatCard, ProfileItem, AppointmentsTable, SettingsView) remain the same as your previous logic.
// Ensure they are present at the bottom of the file.