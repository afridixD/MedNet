"use client";
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Calendar, Users, LogOut, 
  Plus, Trash2, Edit3, DollarSign, Link, UserPlus 
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [medicines, setMedicines] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [stats, setStats] = useState({ patients: 0, doctors: 0, assistants: 0, admins: 0 });

  const fetchData = async () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'Admin') { window.location.href = '/admin/login'; return; }
    
    try {
      const cacheBuster = `?t=${Date.now()}`;
      const [invRes, statsRes, accRes, staffRes] = await Promise.all([
        fetch(`/api/admin/inventory${cacheBuster}`),
        fetch(`/api/admin/stats${cacheBuster}`),
        fetch(`/api/admin/accounts${cacheBuster}`), // New API for CRUD
        fetch(`/api/admin/staff-mapping${cacheBuster}`) // New API for Doctor-Assistant list
      ]);

      setMedicines(await invRes.json());
      setStats(await statsRes.json());
      setAccounts(await accRes.json());
      
      const staffData = await staffRes.json();
      setDoctors(staffData.doctors || []);
      setAssistants(staffData.assistants || []);
    } catch (err) {
      console.error("Admin Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Action Handlers
  const handleDeleteAccount = async (id) => {
    if(!confirm("Are you sure? This will remove all associated medical records.")) return;
    const res = await fetch(`/api/admin/accounts?id=${id}`, { method: 'DELETE' });
    if(res.ok) fetchData();
  };

  const handleAssignStaff = async (doctorId, assistantId) => {
    const res = await fetch(`/api/admin/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId, assistantId })
    });
    if(res.ok) alert("Staff Assigned Successfully!");
  };

  const handleUpdateFee = async (doctorId, newFee) => {
    const res = await fetch(`/api/admin/doctors/fees`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId, fee: newFee })
    });
    if(res.ok) alert("Consultation Fee Updated!");
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse">Syncing MedNet Global Admin...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50 font-manrope">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-8"><h2 className="text-3xl font-black text-blue-600 tracking-tighter">MedNet</h2></div>
        <nav className="flex-1 px-4 space-y-2">
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={20}/>} label="Overview" />
          <NavItem active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} icon={<Users size={20}/>} label="User Accounts" />
          <NavItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={20}/>} label="Medicine Stock" />
          <NavItem active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={<DollarSign size={20}/>} label="Fees & Billing" />
        </nav>
        <div className="p-6 border-t border-slate-100">
          <button onClick={() => { localStorage.clear(); window.location.href='/admin/login'; }} className="flex items-center gap-4 text-slate-500 font-bold hover:text-red-500 transition-colors px-6 py-4 w-full text-left">
            <LogOut size={20}/> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter capitalize">{activeTab} Panel</h1>
            <p className="text-slate-500 font-medium">MedNet Global System Administration</p>
          </div>
          {activeTab === 'accounts' && (
            <button className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95">
              <UserPlus size={22}/> Create New Account
            </button>
          )}
        </header>

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-700">
            <StatCard label="Patients" value={stats.patients} color="text-red-500" />
            <StatCard label="Doctors" value={stats.doctors} color="text-blue-500" />
            <StatCard label="Assistants" value={stats.assistants} color="text-amber-500" />
            <StatCard label="Stock Items" value={medicines.length} color="text-green-500" />
          </div>
        )}

        {/* 2. USER ACCOUNTS TAB (Add/Edit/Delete) */}
        {activeTab === 'accounts' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-bold text-slate-900">{acc.name}<br/><span className="text-xs text-slate-400 font-medium">{acc.email}</span></td>
                    <td className="p-6"><span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase">{acc.role}</span></td>
                    <td className="p-6 flex gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600"><Edit3 size={18}/></button>
                      <button onClick={() => handleDeleteAccount(acc.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. MEDICINE STOCK TAB */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medicine</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines.map(med => (
                  <tr key={med.id}>
                    <td className="p-6 font-bold">{med.name}</td>
                    <td className="p-6 font-black text-blue-600">{med.stock} Units</td>
                    <td className="p-6">
                      <span className={`font-black text-xs ${med.stock < 20 ? 'text-red-500' : 'text-green-500'}`}>
                        {med.stock < 20 ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. BILLING & FEES TAB (Assignment & Pricing) */}
        {activeTab === 'billing' && (
          <div className="space-y-10">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200">
              <h3 className="text-xl font-black mb-6">Staff Assignment & Consultation Fees</h3>
              <div className="space-y-6">
                {doctors.map(doc => (
                  <div key={doc.doctor_id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black">Dr</div>
                      <div>
                        <p className="font-black text-slate-900">Dr. {doc.name}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{doc.specialization}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-10">
                      {/* Fee Management */}
                      <div className="flex items-center gap-3">
                        <DollarSign size={16} className="text-slate-400"/>
                        <input 
                          type="number" 
                          defaultValue={doc.consultation_fee} 
                          onBlur={(e) => handleUpdateFee(doc.doctor_id, e.target.value)}
                          className="w-24 bg-white border border-slate-200 rounded-xl p-2 font-black text-center"
                        />
                      </div>

                      {/* Assistant Assignment */}
                      <div className="flex items-center gap-3">
                        <Link size={16} className="text-slate-400"/>
                        <select 
                          className="bg-white border border-slate-200 rounded-xl p-2 font-bold text-sm"
                          defaultValue={doc.assistant_id || ""}
                          onChange={(e) => handleAssignStaff(doc.doctor_id, e.target.value)}
                        >
                          <option value="">No Assistant</option>
                          {assistants.map(asst => (
                            <option key={asst.assistant_id} value={asst.assistant_id}>{asst.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <h3 className={`text-5xl font-black tracking-tighter ${color}`}>{value}</h3>
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