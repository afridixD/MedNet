"use client";
import { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, FileText, CreditCard, LogOut, Plus, Activity, Droplets, User, Settings } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false); 
  
  const [doctors, setDoctors] = useState([]); 
  const [selectedSpec, setSelectedSpec] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [bookingData, setBookingData] = useState({ doctorId: '', date: '', time: '' });

  useEffect(() => {
    async function fetchData() {
      const storedUserId = localStorage.getItem('userId');
      const params = new URLSearchParams(window.location.search);
      const userId = params.get('userId') || storedUserId || 6;

      try {
        const [appRes, profRes, docListRes] = await Promise.all([
          fetch(`/api/appointments?userId=${userId}`),
          fetch(`/api/profile?userId=${userId}`),
          fetch(`/api/appointments`) 
        ]);
        
        const appData = await appRes.json();
        const profData = await profRes.json();
        const docListData = await docListRes.json();

        setAppointments(Array.isArray(appData) ? appData : []);
        setProfile(profData);
        setDoctors(Array.isArray(docListData) ? docListData : []);
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSpec) {
      setFilteredDoctors(doctors.filter(d => d.specialization === selectedSpec));
    } else {
      setFilteredDoctors([]);
    }
  }, [selectedSpec, doctors]);

  const specializations = [...new Set(doctors.map(d => d.specialization))];

  const calculateAge = (dob) => {
    if (!dob || dob === "0000-00-00") return "N/A";
    const birthDate = new Date(dob);
    return Math.abs(new Date(Date.now() - birthDate.getTime()).getUTCFullYear() - 1970);
  };

  const calculateBMI = (w, h) => {
    if (!w || !h || w === 0 || h === 0) return "N/A";
    return (w / ((h / 100) ** 2)).toFixed(1);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse">Syncing MedNet Database...</div>;

  const bmi = calculateBMI(profile?.weight, profile?.height);
  const age = calculateAge(profile?.dob);

  return (
    <div className="flex min-h-screen bg-slate-50 font-manrope">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-8"><h2 className="text-3xl font-black text-blue-600 tracking-tighter">MedNet</h2></div>
        <nav className="flex-1 px-4 space-y-2">
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={20}/>} label="Overview" />
          <NavItem active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} icon={<Calendar size={20}/>} label="Appointments" />
          <NavItem active={activeTab === 'prescriptions'} onClick={() => setActiveTab('prescriptions')} icon={<FileText size={20}/>} label="Prescriptions" />
          <NavItem active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={<CreditCard size={20}/>} label="Billing" />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20}/>} label="Settings" />
        </nav>
        <div className="p-6 border-t border-slate-100">
          <button onClick={() => { localStorage.clear(); window.location.href='/login'; }} className="flex items-center gap-4 text-slate-500 font-bold px-6 py-4 w-full text-left hover:text-red-500 transition-colors">
            <LogOut size={20}/> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter capitalize">{activeTab}</h1>
            <p className="text-slate-500 font-medium">Account ID: <span className="text-blue-600 font-bold">#PAT-{profile?.userId}</span></p>
          </div>
          <button onClick={() => setIsBookingOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-200 transition-all active:scale-95 group">
            <Plus size={22}/> Book New Appointment
          </button>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="Total Visits" value={appointments.length} icon={<Activity className="text-blue-500"/>} />
              <StatCard label="Blood Group" value={profile?.bloodGroup || "N/A"} icon={<Droplets className="text-red-500"/>} />
              <StatCard label="Age" value={age === "N/A" ? "N/A" : `${age} Yrs`} icon={<User className="text-green-500"/>} />
              <StatCard label="BMI Status" value={bmi === "N/A" ? "N/A" : (bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : "Overweight")} icon={<Activity className="text-amber-500"/>} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6"><h3 className="text-2xl font-black">Recent Activity</h3><AppointmentsTable data={appointments.slice(0, 4)} /></div>
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
                <h3 className="text-xl font-black mb-6">Patient Profile</h3>
                <div className="space-y-4 font-bold">
                    <ProfileItem label="Name" value={profile?.name || "N/A"} />
                    <ProfileItem label="Weight" value={profile?.weight ? `${profile.weight} kg` : "N/A"} />
                    <ProfileItem label="Height" value={profile?.height ? `${profile.height} cm` : "N/A"} />
                    <ProfileItem label="BMI Index" value={bmi} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && <AppointmentsTable data={appointments} />}
        {activeTab === 'settings' && <SettingsView profile={profile} setProfile={setProfile} />}
        {(activeTab === 'prescriptions' || activeTab === 'billing') && (
          <div className="p-20 text-center text-slate-400 font-bold italic bg-white rounded-[2rem] border border-slate-200">
            No {activeTab} available at this time.
          </div>
        )}
      </main>

      {isBookingOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Book Appointment</h2>
              <button onClick={() => { setIsBookingOpen(false); setSelectedSpec(''); }} className="text-slate-400 hover:text-red-500"><Plus size={32} className="rotate-45" /></button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (bookingLoading) return;
              setBookingLoading(true);

              const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  userId: profile.userId, 
                  doctorId: bookingData.doctorId, 
                  date: `${bookingData.date} ${bookingData.time}` 
                })
              });

              if (res.ok) {
                alert("Appointment Requested Successfully!");
                window.location.reload(); 
              } else {
                const err = await res.json();
                alert(err.error || "Failed to book.");
                setBookingLoading(false);
              }
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">1. Specialization</label>
                <select required className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold" onChange={(e) => setSelectedSpec(e.target.value)}>
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">2. Doctor</label>
                <select required disabled={!selectedSpec} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold disabled:opacity-50" onChange={(e) => setBookingData({...bookingData, doctorId: e.target.value})}>
                  <option value="">Choose Doctor</option>
                  {filteredDoctors.map(doc => <option key={doc.doctor_id} value={doc.doctor_id}>Dr. {doc.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">3. Time</label>
                  <select required className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold" onChange={(e) => setBookingData({...bookingData, time: e.target.value})}>
                    <option value="">Select Time</option>
                    <option value="10:00:00">10:00 AM</option>
                    <option value="14:00:00">02:00 PM</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">4. Date</label>
                  <input type="date" required className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold" onChange={(e) => setBookingData({...bookingData, date: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={bookingLoading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg disabled:bg-slate-300">
                {bookingLoading ? 'Syncing...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-105' : 'text-slate-500 hover:bg-slate-100'}`}>
      {icon} {label}
    </button>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">{icon}</div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{value}</h3>
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1"><span className="text-slate-500 font-bold">{label}</span><span className="text-slate-900 font-black">{value}</span></div>
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
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length > 0 ? data.map((appt) => (
            <tr key={appt.appointment_id} className="hover:bg-slate-50 transition-colors cursor-pointer">
              <td className="p-6 font-bold text-slate-900">{appt.doctor_name}</td>
              <td className="p-6 text-slate-600 font-medium">{appt.specialization}</td>
              <td className="p-6 text-slate-500 font-medium">
                {new Date(appt.appointment_date).toLocaleString('en-US', {
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </td>
              <td className="p-6">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${appt.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                  {appt.status}
                </span>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="4" className="p-20 text-center text-slate-400 font-bold italic">No records found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SettingsView({ profile, setProfile }) {
  const [saving, setSaving] = useState(false);
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target);
    const updatedData = {
      userId: profile.userId,
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      dob: formData.get("dob"),
      weight: parseFloat(formData.get("weight")),
      height: parseFloat(formData.get("height")),
    };
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (response.ok) {
        setProfile({ ...profile, ...updatedData });
        alert("Saves Changed Successfully!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] border border-slate-200 p-12 max-w-4xl shadow-sm">
      <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100"><div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center"><Settings size={24} /></div><h3 className="text-2xl font-black text-slate-900 tracking-tighter">Profile Settings</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InputGroup name="name" label="Full Name" value={profile?.name || ""} />
        <InputGroup name="email" label="Email Address" value={profile?.email || ""} />
        <InputGroup name="phone" label="Phone Number" value={profile?.phone || ""} />
        <InputGroup name="dob" label="Date of Birth" type="date" value={profile?.dob ? new Date(profile.dob).toISOString().split('T')[0] : ""} />
        <InputGroup name="weight" label="Weight (kg)" type="number" value={profile?.weight || ""} />
        <InputGroup name="height" label="Height (cm)" type="number" value={profile?.height || ""} />
      </div>
      <div className="mt-12 flex justify-end"><button type="submit" disabled={saving} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-slate-900 disabled:bg-slate-300">{saving ? 'Syncing...' : 'Save Changes'}</button></div>
    </form>
  );
}

function InputGroup({ label, name, value, type = "text" }) {
  return (
    <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">{label}</label><input name={name} type={type} defaultValue={value} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all" /></div>
  );
}