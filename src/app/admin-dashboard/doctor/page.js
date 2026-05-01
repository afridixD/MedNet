"use client";
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, LogOut, Activity, Users, 
  ClipboardCheck, FileText, Send, X
} from 'lucide-react';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [inventory, setInventory] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Prescription Modal States
  const [isPrescribing, setIsPrescribing] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({ notes: '', medicines: [] });

  // Controlled inputs for medicine selection (replacing direct DOM access)
  const [selectedMedId, setSelectedMedId] = useState('');
  const [dosageInput, setDosageInput] = useState('');

  const fetchData = async () => {
  const storedUserId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  if (!storedUserId || userRole !== 'Doctor') {
    window.location.href = '/login'; 
    return;
  }

  try {
    const cacheBuster = `&t=${Date.now()}`;
    const [appRes, profRes, invRes] = await Promise.all([
      fetch(`/api/doctor/appointments?userId=${storedUserId}${cacheBuster}`),
       fetch(`/api/profile/doctor?userId=${storedUserId}`),
      fetch(`/api/admin/inventory?t=${Date.now()}`) 
    ]);

    // Log which APIs are failing without stopping execution
    if (!appRes.ok) console.error("Appointments API failed:", appRes.status, appRes.statusText);
    if (!profRes.ok) console.error("Profile API failed:", profRes.status, profRes.statusText);
    if (!invRes.ok) console.error("Inventory API failed:", invRes.status, invRes.statusText);

    const appData = await appRes.json();
    const profData = await profRes.json();
    const invData = await invRes.json();

    console.log("DEBUG - doctorInfo:", profData);
    console.log("DEBUG - appointments[0]:", Array.isArray(appData) ? appData[0] : appData);
    console.log("DEBUG - inventory[0]:", Array.isArray(invData) ? invData[0] : invData);

    setAppointments(Array.isArray(appData) ? appData : []);
    setDoctorInfo(profData);
    setInventory(Array.isArray(invData) ? invData : []);
  } catch (error) {
    console.error("Doctor Sync Error:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchData(); }, []);

  const handleAddMedicine = () => {
    const medicine = inventory.find(m => String(m.id) === String(selectedMedId) || String(m.medicine_id) === String(selectedMedId));
    
    if (!medicine) {
      alert("Please select a medicine.");
      return;
    }
    if (!dosageInput.trim()) {
      alert("Please enter a dosage.");
      return;
    }

    // Support both 'id' and 'medicine_id' field names from your inventory API
    const medId = medicine.id ?? medicine.medicine_id;

    setPrescriptionData(prev => ({
      ...prev, 
      medicines: [...prev.medicines, { id: medId, name: medicine.name, dosage: dosageInput.trim() }]
    }));
    setSelectedMedId('');
    setDosageInput('');
  };

  const handleRemoveMedicine = (index) => {
    setPrescriptionData(prev => {
      const newMeds = [...prev.medicines];
      newMeds.splice(index, 1);
      return { ...prev, medicines: newMeds };
    });
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    
    if (!prescriptionData.notes.trim()) {
      alert("Please add clinical notes.");
      return;
    }

    // Resolve doctor_id — tries multiple possible field names from the profile API
    const doctorId = 
      doctorInfo?.doctor_id ?? 
      doctorInfo?.id ?? 
      doctorInfo?.userId ??
      Number(localStorage.getItem('userId'));

    // Resolve patient_id — tries multiple possible field names from appointments API
    const patientId = 
      selectedAppt?.patient_id ?? 
      selectedAppt?.patientId ?? 
      selectedAppt?.user_id;

    const appointmentId = 
      selectedAppt?.appointment_id ?? 
      selectedAppt?.appointmentId ?? 
      selectedAppt?.id;

    // DEBUG: Log what we're about to send
    console.log("DEBUG - Prescription Payload:", {
      appointment_id: appointmentId,
      doctor_id: doctorId,
      patient_id: patientId,
      notes: prescriptionData.notes,
      medicines: prescriptionData.medicines,
    });

    if (!doctorId || !patientId || !appointmentId) {
      alert(`Missing required IDs. Check console.\n- doctor_id: ${doctorId}\n- patient_id: ${patientId}\n- appointment_id: ${appointmentId}`);
      return;
    }

    try {
      const payload = {
        appointment_id: Number(appointmentId),
        doctor_id: Number(doctorId),
        patient_id: Number(patientId),
        notes: prescriptionData.notes,
        medicines: prescriptionData.medicines.map(m => ({
          medicine_id: Number(m.id),
          dosage: m.dosage
        }))
      };

      const res = await fetch('/api/doctor/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok) {
        alert("Consultation Done!");
        setIsPrescribing(false);
        setSelectedAppt(null);
        setPrescriptionData({ notes: '', medicines: [] });
        fetchData(); 
      } else {
        // Show the full server error to help debug
        console.error("Server Error Response:", result);
        alert(`Error: ${result.message || result.error || JSON.stringify(result)}`);
      }
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Network error. Please check your server console.");
    }
  };

  const handleOpenPrescription = (appt) => {
    setSelectedAppt(appt);
    setPrescriptionData({ notes: '', medicines: [] });
    setSelectedMedId('');
    setDosageInput('');
    setIsPrescribing(true);
  };

  const handleCloseModal = () => {
    setIsPrescribing(false);
    setSelectedAppt(null);
    setPrescriptionData({ notes: '', medicines: [] });
    setSelectedMedId('');
    setDosageInput('');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse">
      Syncing MedNet...
    </div>
  );

  const activeQueue = appointments.filter(a => !a.prescription_id);
  const checkedPatients = appointments.filter(a => a.prescription_id);

  return (
    <div className="flex min-h-screen bg-slate-50 font-manrope">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-8">
          <h2 className="text-3xl font-black text-blue-600 tracking-tighter">MedNet</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={20}/>} label="Overview" />
          <NavItem active={activeTab === 'queue'} onClick={() => setActiveTab('queue')} icon={<Calendar size={20}/>} label="Patient Queue" />
          <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<FileText size={20}/>} label="Visit History" />
        </nav>
        <div className="p-6 border-t border-slate-100">
          <button 
            onClick={() => { localStorage.clear(); window.location.href='/login'; }} 
            className="flex items-center gap-4 text-slate-500 font-bold hover:text-red-500 transition-colors px-6 py-4 w-full text-left font-manrope"
          >
            <LogOut size={20}/> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter capitalize">
              {activeTab === 'overview' ? 'Doctor Console' : activeTab}
            </h1>
            <p className="text-slate-500 font-medium">Welcome, Dr. {doctorInfo?.name || 'Staff'}</p>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Total Queue" value={activeQueue.length} icon={<Activity className="text-amber-500"/>} />
              <StatCard label="Patients Checked" value={checkedPatients.length} icon={<ClipboardCheck className="text-green-500"/>} />
              <StatCard label="Total Patients" value={appointments.length} icon={<Users className="text-blue-500"/>} />
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Active Queue</h3>
              <DoctorTable data={activeQueue} onPrescribe={handleOpenPrescription} />
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Queue Management</h3>
            <DoctorTable data={activeQueue} onPrescribe={handleOpenPrescription} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-2xl font-black text-slate-800">Past Consultations</h3>
            <DoctorTable data={checkedPatients} />
          </div>
        )}
      </main>

      {/* Prescription Modal */}
      {isPrescribing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Digital Prescription</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-red-500">
                <X size={32}/>
              </button>
            </div>

            <form onSubmit={handlePrescriptionSubmit} className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-3xl flex justify-between items-center">
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Patient Name</p>
                  <p className="text-xl font-black text-blue-600">{selectedAppt?.patient_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Blood Group</p>
                  <p className="text-lg font-black text-slate-900">{selectedAppt?.blood_group || 'N/A'}</p>
                </div>
              </div>

              <textarea 
                required 
                placeholder="Diagnosis and clinical advice..." 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold min-h-[120px] outline-none focus:ring-2 focus:ring-blue-600 transition-all" 
                value={prescriptionData.notes}
                onChange={(e) => setPrescriptionData(prev => ({ ...prev, notes: e.target.value }))} 
              />

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
                  Medication List
                </label>
                <div className="flex gap-4">
                  <select 
                    className="flex-1 bg-slate-50 border-none rounded-xl p-4 font-bold outline-none"
                    value={selectedMedId}
                    onChange={(e) => setSelectedMedId(e.target.value)}
                  >
                    <option value="">Select Medicine</option>
                    {inventory.map(med => (
                      // Support both 'id' and 'medicine_id' as the key/value
                      <option key={med.id ?? med.medicine_id} value={med.id ?? med.medicine_id}>
                        {med.name}
                      </option>
                    ))}
                  </select>

                  <input 
                    type="text" 
                    placeholder="Dosage" 
                    className="w-40 bg-slate-50 border-none rounded-xl p-4 font-bold outline-none"
                    value={dosageInput}
                    onChange={(e) => setDosageInput(e.target.value)}
                  />

                  <button 
                    type="button" 
                    className="bg-slate-900 text-white px-6 rounded-xl font-black active:scale-95 transition-all"
                    onClick={handleAddMedicine}
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 mt-4">
                  {prescriptionData.medicines.map((m, i) => (
                    <div 
                      key={i} 
                      className="flex justify-between p-4 bg-blue-50 rounded-xl font-bold text-blue-700 animate-in slide-in-from-left-2"
                    >
                      <span>{m.name}</span>
                      <div className="flex gap-4 items-center">
                        <span>{m.dosage}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveMedicine(i)} 
                          className="text-red-400 hover:text-red-600"
                        >
                          <X size={16}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
              >
                <Send size={20}/> Done - Complete Visit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DoctorTable({ data, onPrescribe }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length > 0 ? data.map((appt) => (
            <tr key={appt.appointment_id ?? appt.id} className="hover:bg-slate-50 transition-colors group">
              <td className="p-6">
                <p className="font-bold text-slate-900">{appt.patient_name}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {appt.gender} • {appt.blood_group || 'N/A'}
                </p>
              </td>
              <td className="p-6 text-slate-500 font-medium">
                {new Date(appt.appointment_date).toLocaleString('en-US', { 
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                })}
              </td>
              <td className="p-6">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                  appt.prescription_id 
                    ? 'bg-blue-50 text-blue-700 border-blue-100' 
                    : 'bg-green-50 text-green-700 border-green-100'
                }`}>
                  {appt.prescription_id ? 'Checked' : 'In Queue'}
                </span>
              </td>
              <td className="p-6 text-right">
                {!appt.prescription_id && onPrescribe && (
                  <button 
                    onClick={() => onPrescribe(appt)} 
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 transition-all"
                  >
                    Done
                  </button>
                )}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" className="p-20 text-center text-slate-400 font-bold italic">
                No active records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
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

function NavItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-200 ${
        active 
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-105' 
          : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {icon} {label}
    </button>
  );
}
