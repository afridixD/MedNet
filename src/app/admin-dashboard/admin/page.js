"use client";
import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Package, Users, LogOut,
  Plus, Trash2, Edit3, DollarSign, Link, UserPlus,
  X, Check, AlertCircle, Receipt, RefreshCw, FilePlus
} from 'lucide-react';

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
    <button onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}>
      {icon} {label}
    </button>
  );
}

function AccountModal({ onClose, onSave, editData }) {
  const [form, setForm] = useState(
    editData
      ? { username: editData.name || '', email: editData.email || '', password: '', role: editData.role || 'Patient' }
      : { username: '', email: '', password: '', role: 'Patient' }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.email || (!editData && !form.password)) {
      alert("Please fill all required fields.");
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-900">{editData ? 'Edit Account' : 'Create Account'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Username</label>
            <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" placeholder="john_doe" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
          </div>
          {!editData && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500">
              <option>Patient</option>
              <option>Doctor</option>
              <option>Assistant</option>
              <option>Admin</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 font-black text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-colors disabled:opacity-60">
            {saving ? 'Saving...' : editData ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MedicineModal({ onClose, onSave, editData }) {
  const [form, setForm] = useState(
    editData
      ? { name: editData.name || '', category: editData.category || '', price_per_unit: editData.price_per_unit ?? '', stock_quantity: '', reorder_level: editData.reorder_level ?? 20 }
      : { name: '', category: '', price_per_unit: '', stock_quantity: '', reorder_level: 20 }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.price_per_unit || (!editData && !form.stock_quantity)) {
      alert("Please fill all required fields.");
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const fields = editData
    ? [
        { label: 'Medicine Name', key: 'name', type: 'text', placeholder: 'Paracetamol 500mg' },
        { label: 'Category', key: 'category', type: 'text', placeholder: 'Analgesic' },
        { label: 'Price Per Unit (৳)', key: 'price_per_unit', type: 'number', placeholder: '5.00' },
        { label: 'Add Stock (adds to current)', key: 'stock_quantity', type: 'number', placeholder: 'e.g. 50 → adds 50 units' },
        { label: 'Reorder Level', key: 'reorder_level', type: 'number', placeholder: '20' },
      ]
    : [
        { label: 'Medicine Name', key: 'name', type: 'text', placeholder: 'Paracetamol 500mg' },
        { label: 'Category', key: 'category', type: 'text', placeholder: 'Analgesic' },
        { label: 'Price Per Unit (৳)', key: 'price_per_unit', type: 'number', placeholder: '5.00' },
        { label: 'Initial Stock Quantity', key: 'stock_quantity', type: 'number', placeholder: '100' },
        { label: 'Reorder Level', key: 'reorder_level', type: 'number', placeholder: '20' },
      ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-900">{editData ? 'Edit Medicine' : 'Add Medicine'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        {editData && (
          <div className="mb-4 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-black text-blue-600">Current stock: <span className="text-blue-800">{editData.stock} units</span></p>
            <p className="text-xs text-blue-500 font-medium mt-1">Adding stock will be added on top of current quantity.</p>
          </div>
        )}
        <div className="space-y-4">
          {fields.map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
              <input
                type={type}
                value={form[key] ?? ''}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 font-black text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-colors disabled:opacity-60">
            {saving ? 'Saving...' : editData ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InvoiceModal({ onClose, onSave, patients, doctors, medicines }) {
  const [form, setForm] = useState({ patientId: '', doctorId: '', items: [] });
  const [saving, setSaving] = useState(false);
  const [medId, setMedId] = useState('');
  const [medQty, setMedQty] = useState(1);

  const selectedDoctor = doctors.find(d => String(d.doctor_id) === String(form.doctorId));
  const consultFee = selectedDoctor ? Number(selectedDoctor.consultation_fee || 0) : 0;
  const medicineTot = form.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const grandTotal = consultFee + medicineTot;

  const addItem = () => {
    if (!medId) return;
    const med = medicines.find(m => String(m.id) === String(medId));
    if (!med) return;
    const exists = form.items.find(i => String(i.id) === String(medId));
    if (exists) {
      setForm(f => ({ ...f, items: f.items.map(i => String(i.id) === String(medId) ? { ...i, qty: i.qty + Number(medQty) } : i) }));
    } else {
      setForm(f => ({ ...f, items: [...f.items, { id: med.id, name: med.name, price: Number(med.price_per_unit), qty: Number(medQty) }] }));
    }
    setMedId('');
    setMedQty(1);
  };

  const removeItem = (id) => setForm(f => ({ ...f, items: f.items.filter(i => String(i.id) !== String(id)) }));

  const handleSubmit = async () => {
    if (!form.patientId || !form.doctorId) { alert("Please select a patient and doctor."); return; }
    setSaving(true);
    await onSave({ patientId: form.patientId, doctorId: form.doctorId, items: form.items, consultFee, medicineTot, grandTotal });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl p-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-900">Create Invoice</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} className="text-slate-500" /></button>
        </div>
        <div className="mb-4">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Patient</label>
          <select value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}
            className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select patient...</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.email})</option>)}
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Doctor</label>
          <select value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}
            className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select doctor...</option>
            {/* FIXED: Removed Dr. prefix */}
            {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>{d.name} — ৳{Number(d.consultation_fee || 0).toFixed(2)}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Add Medicines</label>
          <div className="flex gap-2">
            <select value={medId} onChange={e => setMedId(e.target.value)}
              className="flex-1 p-3 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select medicine...</option>
              {medicines.map(m => <option key={m.id} value={m.id}>{m.name} — ৳{Number(m.price_per_unit).toFixed(2)} ({m.stock} left)</option>)}
            </select>
            <input type="number" min="1" value={medQty} onChange={e => setMedQty(Number(e.target.value))}
              className="w-20 p-3 rounded-xl border border-slate-200 font-bold text-center outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={addItem} className="px-4 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-colors">
              <Plus size={18} />
            </button>
          </div>
        </div>
        {form.items.length > 0 && (
          <div className="mb-6 space-y-2">
            {form.items.map(item => (
              <div key={item.id} className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800 text-sm">{item.name} × {item.qty}</span>
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-700">৳{(item.price * item.qty).toFixed(2)}</span>
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="bg-slate-50 rounded-2xl p-5 mb-6 space-y-2">
          <div className="flex justify-between text-sm font-bold text-slate-600">
            <span>Consultation Fee</span><span>৳{consultFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-600">
            <span>Medicine Total</span><span>৳{medicineTot.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black text-slate-900 text-lg border-t border-slate-200 pt-2 mt-2">
            <span>Grand Total</span><span>৳{grandTotal.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 font-black text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-colors disabled:opacity-60">
            {saving ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BillingTab({ doctors, assistants, onSave }) {
  const [localDoctors, setLocalDoctors] = useState([]);
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});

  useEffect(() => {
    setLocalDoctors(doctors.map(d => ({ ...d, _fee: d.consultation_fee ?? 0, _assistantId: d.assistant_id ?? '' })));
  }, [doctors]);

  const handleSave = async (doc) => {
    setSaving(prev => ({ ...prev, [doc.doctor_id]: true }));
    await onSave(doc.doctor_id, doc._fee, doc._assistantId);
    setSaving(prev => ({ ...prev, [doc.doctor_id]: false }));
    setSaved(prev => ({ ...prev, [doc.doctor_id]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [doc.doctor_id]: false })), 2000);
  };

  const update = (doctorId, field, value) => {
    setLocalDoctors(prev => prev.map(d => d.doctor_id === doctorId ? { ...d, [field]: value } : d));
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200">
      <h3 className="text-xl font-black mb-6 text-slate-900">Doctor Fees & Assistant Assignment</h3>
      <div className="space-y-4">
        {localDoctors.map(doc => (
          <div key={doc.doctor_id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-sm">Dr</div>
              <div>
                {/* FIXED: Removed Dr. prefix */}
                <p className="font-black text-slate-900">{doc.name}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{doc.specialization || 'General'}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-400 uppercase">Fee ৳</span>
                <input
                  type="number"
                  value={doc._fee ?? 0}
                  onChange={e => update(doc.doctor_id, '_fee', e.target.value)}
                  className="w-24 bg-white border border-slate-200 rounded-xl p-2 font-black text-center outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Link size={14} className="text-slate-400" />
                <select
                  value={doc._assistantId ?? ''}
                  onChange={e => update(doc.doctor_id, '_assistantId', e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl p-2 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Assistant</option>
                  {assistants.map(a => (
                    <option key={a.assistant_id} value={a.assistant_id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => handleSave(doc)}
                disabled={saving[doc.doctor_id]}
                className={`px-5 py-2 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-60 min-w-[80px] ${saved[doc.doctor_id] ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {saving[doc.doctor_id] ? 'Saving...' : saved[doc.doctor_id] ? '✓ Saved' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ patients: 0, doctors: 0, assistants: 0, total_revenue: 0, paid_invoices: 0, unpaid_invoices: 0 });
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [editMedicine, setEditMedicine] = useState(null);

  const patients = accounts.filter(a => a.role === 'Patient');

  const fetchData = useCallback(async (showLoader = true) => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'Admin') { window.location.href = '/admin/login'; return; }
    if (showLoader) setLoading(true);
    try {
      const t = `?t=${Date.now()}`;
      const [invRes, statsRes, accRes, staffRes, billRes] = await Promise.all([
        fetch(`/api/admin/inventory${t}`),
        fetch(`/api/admin/stats${t}`),
        fetch(`/api/admin/accounts${t}`),
        fetch(`/api/admin/staff-mapping${t}`),
        fetch(`/api/admin/billing${t}`)
      ]);
      const [invData, statsData, accData, staffData, billData] = await Promise.all([
        invRes.json(), statsRes.json(), accRes.json(), staffRes.json(), billRes.json()
      ]);
      setMedicines(Array.isArray(invData) ? invData : []);
      setStats(statsData || {});
      setAccounts(Array.isArray(accData) ? accData : []);
      setDoctors(Array.isArray(staffData.doctors) ? staffData.doctors : []);
      setAssistants(Array.isArray(staffData.assistants) ? staffData.assistants : []);
      setInvoices(Array.isArray(billData) ? billData : []);
    } catch (err) {
      console.error("Admin Sync Error:", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(true); }, [fetchData]);

  const handleSaveAccount = async (form) => {
    const isEdit = !!editAccount;
    if (isEdit) {
      setAccounts(prev => prev.map(a => a.id === editAccount.id
        ? { ...a, name: form.username, email: form.email, role: form.role }
        : a));
    } else {
      const tempAcc = { id: `temp-${Date.now()}`, name: form.username, email: form.email, role: form.role, created_at: new Date().toISOString() };
      setAccounts(prev => [tempAcc, ...prev]);
    }
    setShowAccountModal(false);
    setEditAccount(null);
    const res = await fetch('/api/admin/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed'); fetchData(false); }
    else { fetchData(false); }
  };

  const handleDeleteAccount = async (id) => {
    if (!confirm("Are you sure? This will remove all associated records.")) return;
    setAccounts(prev => prev.filter(a => a.id !== id));
    const res = await fetch(`/api/admin/accounts?id=${id}`, { method: 'DELETE' });
    if (!res.ok) fetchData(false);
  };

  const handleSaveMedicine = async (form) => {
    const isEdit = !!editMedicine;
    if (isEdit) {
      setMedicines(prev => prev.map(m => m.id === editMedicine.id
        ? { ...m, name: form.name, category: form.category, price_per_unit: form.price_per_unit, stock: form.stock_quantity ? m.stock + Number(form.stock_quantity) : m.stock, reorder_level: form.reorder_level }
        : m));
    } else {
      const temp = { id: `temp-${Date.now()}`, name: form.name, category: form.category, price_per_unit: form.price_per_unit, stock: Number(form.stock_quantity), reorder_level: Number(form.reorder_level) };
      setMedicines(prev => [temp, ...prev]);
    }
    setShowMedicineModal(false);
    setEditMedicine(null);
    const method = isEdit ? 'PATCH' : 'POST';
    const body = isEdit ? { ...form, id: editMedicine.id } : form;
    const res = await fetch('/api/admin/inventory', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed'); fetchData(false); }
    else { fetchData(false); }
  };

  const handleDeleteMedicine = async (id) => {
    if (!confirm("Delete this medicine?")) return;
    setMedicines(prev => prev.filter(m => m.id !== id));
    const res = await fetch(`/api/admin/inventory?id=${id}`, { method: 'DELETE' });
    if (!res.ok) fetchData(false);
  };

  const handleCreateInvoice = async ({ patientId, doctorId, items, consultFee, medicineTot, grandTotal }) => {
    const res = await fetch('/api/admin/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, doctorId, items, consultFee, medicineTot, grandTotal })
    });
    if (res.ok) { setShowInvoiceModal(false); fetchData(false); }
    else { const d = await res.json(); alert(d.error || 'Failed to create invoice'); }
  };

  const handleTogglePayment = async (invoice_id, current_status) => {
    const newStatus = current_status === 'Paid' ? 'Unpaid' : 'Paid';
    setInvoices(prev => prev.map(inv => inv.invoice_id === invoice_id ? { ...inv, payment_status: newStatus } : inv));
    const res = await fetch('/api/admin/billing', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invoice_id, payment_status: newStatus }) });
    if (!res.ok) fetchData(false);
  };

  const roleColor = {
    Patient: 'bg-green-100 text-green-700',
    Doctor: 'bg-blue-100 text-blue-700',
    Assistant: 'bg-amber-100 text-amber-700',
    Admin: 'bg-red-100 text-red-700',
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse text-xl">
      Syncing MedNet Admin...
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {showAccountModal && (
        <AccountModal editData={editAccount}
          onClose={() => { setShowAccountModal(false); setEditAccount(null); }}
          onSave={handleSaveAccount} />
      )}
      {showMedicineModal && (
        <MedicineModal editData={editMedicine}
          onClose={() => { setShowMedicineModal(false); setEditMedicine(null); }}
          onSave={handleSaveMedicine} />
      )}
      {showInvoiceModal && (
        <InvoiceModal patients={patients} doctors={doctors} medicines={medicines}
          onClose={() => setShowInvoiceModal(false)}
          onSave={handleCreateInvoice} />
      )}

      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-8">
          <h2 className="text-3xl font-black text-blue-600 tracking-tighter">MedNet</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Admin Console</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} icon={<Users size={20} />} label="User Accounts" />
          <NavItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={20} />} label="Medicine Stock" />
          <NavItem active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={<DollarSign size={20} />} label="Fees & Billing" />
          <NavItem active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} icon={<Receipt size={20} />} label="Invoices" />
        </nav>
        <div className="p-6 border-t border-slate-100">
          <button onClick={() => { localStorage.clear(); window.location.href = '/admin/login'; }}
            className="flex items-center gap-4 text-slate-500 font-bold hover:text-red-500 transition-colors px-6 py-4 w-full text-left">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter capitalize">{activeTab} Panel</h1>
            <p className="text-slate-500 font-medium">MedNet Global System Administration</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchData(true)} className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors text-slate-500">
              <RefreshCw size={18} />
            </button>
            {activeTab === 'accounts' && (
              <button onClick={() => { setEditAccount(null); setShowAccountModal(true); }}
                className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-100 active:scale-95 transition-transform">
                <UserPlus size={22} /> Create Account
              </button>
            )}
            {activeTab === 'inventory' && (
              <button onClick={() => { setEditMedicine(null); setShowMedicineModal(true); }}
                className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-100 active:scale-95 transition-transform">
                <Plus size={22} /> Add Medicine
              </button>
            )}
            {activeTab === 'invoices' && (
              <button onClick={() => setShowInvoiceModal(true)}
                className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-100 active:scale-95 transition-transform">
                <FilePlus size={22} /> Create Invoice
              </button>
            )}
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard label="Patients" value={stats.patients ?? 0} color="text-red-500" />
              <StatCard label="Doctors" value={stats.doctors ?? 0} color="text-blue-500" />
              <StatCard label="Assistants" value={stats.assistants ?? 0} color="text-amber-500" />
              <StatCard label="Stock Items" value={medicines.length} color="text-green-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Revenue</p>
                <h3 className="text-4xl font-black tracking-tighter text-emerald-600">৳{Number(stats.total_revenue || 0).toLocaleString()}</h3>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Paid Invoices</p>
                <h3 className="text-4xl font-black tracking-tighter text-blue-600">{stats.paid_invoices ?? 0}</h3>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Unpaid Invoices</p>
                <h3 className="text-4xl font-black tracking-tighter text-red-500">{stats.unpaid_invoices ?? 0}</h3>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-bold text-slate-900">{acc.name}<br /><span className="text-xs text-slate-400 font-medium">{acc.email}</span></td>
                    <td className="p-6"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${roleColor[acc.role] || 'bg-slate-100 text-slate-600'}`}>{acc.role}</span></td>
                    <td className="p-6 text-sm text-slate-500 font-medium">{new Date(acc.created_at).toLocaleDateString()}</td>
                    <td className="p-6 flex gap-2">
                      <button onClick={() => { setEditAccount(acc); setShowAccountModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => handleDeleteAccount(acc.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medicine</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price/Unit</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines.map(med => (
                  <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-bold text-slate-900">{med.name}</td>
                    <td className="p-6 text-sm text-slate-500 font-medium">{med.category || '—'}</td>
                    <td className="p-6 font-black text-slate-700">৳{Number(med.price_per_unit).toFixed(2)}</td>
                    <td className="p-6 font-black text-blue-600">{med.stock} units</td>
                    <td className="p-6">
                      {med.stock < med.reorder_level
                        ? <span className="flex items-center gap-1 text-red-500 font-black text-xs"><AlertCircle size={14} /> LOW STOCK</span>
                        : <span className="flex items-center gap-1 text-green-500 font-black text-xs"><Check size={14} /> IN STOCK</span>}
                    </td>
                    <td className="p-6 flex gap-2">
                      <button onClick={() => { setEditMedicine(med); setShowMedicineModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => handleDeleteMedicine(med.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'billing' && (
          <BillingTab
            doctors={doctors}
            assistants={assistants}
            onSave={async (doctorId, fee, assistantId) => {
              await Promise.all([
                fetch('/api/admin/doctors/fees', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ doctorId, fee }) }),
                fetch('/api/admin/assign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ doctorId, assistantId }) })
              ]);
              fetchData(false);
            }}
          />
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Consult</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medicine</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.length === 0 && (
                  <tr><td colSpan={7} className="p-10 text-center text-slate-400 font-bold">No invoices yet</td></tr>
                )}
                {invoices.map(inv => (
                  <tr key={inv.invoice_id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-bold text-slate-900">{inv.patient_name || `Patient #${inv.patient_id}`}</td>
                    {/* FIXED: Removed Dr. prefix */}
                    <td className="p-6 text-sm text-slate-600 font-medium">{inv.doctor_name || '—'}</td>
                    <td className="p-6 font-bold text-slate-700">৳{Number(inv.consultation_total).toFixed(2)}</td>
                    <td className="p-6 font-bold text-slate-700">৳{Number(inv.medicine_total).toFixed(2)}</td>
                    <td className="p-6 font-black text-slate-900 text-lg">৳{Number(inv.grand_total).toFixed(2)}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${inv.payment_status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {inv.payment_status}
                      </span>
                    </td>
                    <td className="p-6">
                      <button onClick={() => handleTogglePayment(inv.invoice_id, inv.payment_status)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${inv.payment_status === 'Paid' ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                        {inv.payment_status === 'Paid' ? 'Mark Unpaid' : 'Mark Paid'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}