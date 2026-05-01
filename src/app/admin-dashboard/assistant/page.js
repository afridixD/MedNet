"use client";
import { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, LogOut, Activity, Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function AssistantDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) return;

    try {
      const [appRes, docRes] = await Promise.all([
        fetch(`/api/assistant/appointments?userId=${storedUserId}`), 
        fetch(`/api/assistant/doctors?assistantId=${storedUserId}`)
      ]);
      
      const appData = await appRes.json();
      const docData = await docRes.json();

      setAppointments(Array.isArray(appData) ? appData : []);
      setDoctors(Array.isArray(docData) ? docData : []);
    } catch (error) {
      console.error("Assistant Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/assistant/appointments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, status: newStatus })
      });
      
      if (res.ok) {
        setAppointments(prev => prev.map(a => 
          a.appointment_id === id ? { ...a, status: newStatus } : a
        ));
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // Logic updated: No longer filtering out 'Rejected' status
  const pendingApps = appointments.filter(a => a.status === 'Pending' || a.status === null);
  const confirmedApps = appointments.filter(a => a.status === 'Confirmed');
  const rejectedApps = appointments.filter(a => a.status === 'Rejected');

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse">Syncing Assistant Portal...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50 font-manrope">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-8"><h2 className="text-3xl font-black text-blue-600 tracking-tighter">MedNet</h2></div>
        <nav className="flex-1 px-4 space-y-2">
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={20}/>} label="Overview" />
          <NavItem active={activeTab === 'manage'} onClick={() => setActiveTab('manage')} icon={<Calendar size={20}/>} label="Manage Queue" />
          <NavItem active={activeTab === 'doctors'} onClick={() => setActiveTab('doctors')} icon={<Clock size={20}/>} label="Doctor Status" />
        </nav>
        <div className="p-6 border-t border-slate-100">
          <button onClick={() => { localStorage.clear(); window.location.href='/admin/login'; }} className="flex items-center gap-4 text-slate-500 font-bold hover:text-red-500 transition-colors px-6 py-4 w-full text-left font-manrope">
            <LogOut size={20}/> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-10">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Assistant Console</h1>
          <p className="text-slate-500 font-medium">Manage patient appointments and doctor queues.</p>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="Pending" value={pendingApps.length} icon={<Activity className="text-amber-500"/>} />
              <StatCard label="Confirmed" value={confirmedApps.length} icon={<CheckCircle className="text-green-500"/>} />
              <StatCard label="Rejected" value={rejectedApps.length} icon={<AlertCircle className="text-red-500"/>} />
              <StatCard label="Total Doctors" value={doctors.length} icon={<Users className="text-blue-500"/>} />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200">
              <h3 className="text-xl font-black text-slate-800 mb-6">Recent Pending Requests</h3>
              <AppointmentTable data={pendingApps.slice(0, 5)} onUpdate={handleStatusUpdate} />
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div>
               <h3 className="text-2xl font-black text-slate-800 mb-4">Pending Requests</h3>
               <AppointmentTable data={pendingApps} onUpdate={handleStatusUpdate} />
            </div>
            
            <div>
                <h3 className="text-2xl font-black text-green-700 mb-4">Approved Today</h3>
                <AppointmentTable data={confirmedApps} onUpdate={handleStatusUpdate} />
            </div>

            <div>
                <h3 className="text-2xl font-black text-red-700 mb-4">Rejected Requests</h3>
                <AppointmentTable data={rejectedApps} onUpdate={handleStatusUpdate} />
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
            {doctors.map(doc => (
              <div key={doc.doctor_id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-black text-slate-900">Dr. {doc.name}</h4>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{doc.specialization}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-black text-xs uppercase ${doc.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {doc.is_available ? 'Available' : 'On Leave'}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AppointmentTable({ data, onUpdate }) {
  if (data.length === 0) return <div className="p-10 text-center text-slate-400 font-bold italic bg-white rounded-[2rem] border border-dashed border-slate-200">No records found.</div>;
  
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((appt) => (
            <tr key={appt.appointment_id} className="hover:bg-slate-50 transition-colors">
              <td className="p-6 font-bold text-slate-900">{appt.patient_name}</td>
              <td className="p-6 text-slate-600 font-medium">Dr. {appt.doctor_name}</td>
              <td className="p-6 text-slate-500 font-medium">
                {new Date(appt.appointment_date).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                })}
              </td>
              <td className="p-6">
                {appt.status === 'Pending' || appt.status === null ? (
                  <div className="flex gap-2">
                    <button onClick={() => onUpdate(appt.appointment_id, 'Confirmed')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"><CheckCircle size={18}/></button>
                    <button onClick={() => onUpdate(appt.appointment_id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><XCircle size={18}/></button>
                  </div>
                ) : (
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${appt.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{appt.status}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">{icon}</div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{value}</h3>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-200 font-manrope ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}>
      {icon} {label}
    </button>
  );
}