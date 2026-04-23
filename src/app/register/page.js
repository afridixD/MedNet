import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 font-manrope px-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[450px]">
        <div className="text-center mb-8">
          <h1 className="font-poppins text-3xl font-semibold text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-500 text-base">Join the Healthcare platform today</p>
        </div>

        <form className="space-y-5">

            <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Full Name</label>
            <input 
              type="text"  
              className="w-full p-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Username</label>
            <input 
              type="text" 
              className="w-full p-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Email</label>
            <input 
              type="text" 
              className="w-full p-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Password</label>
            <input 
              type="text" 
              className="w-full p-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <button type="button" className="text-lg w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-200 mt-4">
            Create Account
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-600 font-medium">
          Already have an account? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}