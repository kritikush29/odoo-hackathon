import React, { useState } from 'react';
import {
  Lock, Mail, User, Building, ShieldCheck,
  CheckCircle2, AlertCircle, ArrowRight, KeyRound, Sparkles
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [selectedRole, setSelectedRole] = useState('ADMIN'); // 'ADMIN', 'STAFF', 'CUSTOMER'

  // Login form state
  const [email, setEmail] = useState('admin@brightloop.com');
  const [password, setPassword] = useState('Password123!');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompany, setRegCompany] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password requirements for signup: min 8 chars, 1 uppercase, 1 symbol
  const pwLengthOk = regPassword.length >= 8;
  const pwUpperOk = /[A-Z]/.test(regPassword);
  const pwSpecialOk = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(regPassword);
  const isRegisterPasswordValid = pwLengthOk && pwUpperOk && pwSpecialOk;

  const quickFill = (role) => {
    setSelectedRole(role);
    setActiveTab('login');
    setError('');
    if (role === 'ADMIN') {
      setEmail('admin@brightloop.com');
      setPassword('Password123!');
    } else if (role === 'STAFF') {
      setEmail('staff@brightloop.com');
      setPassword('Password123!');
    } else if (role === 'CUSTOMER') {
      setEmail('sarah@acmecorp.com');
      setPassword('Password123!');
    }
  };

  const handleInstantLogin = async (role) => {
    quickFill(role);
    setError('');
    setLoading(true);

    let targetEmail = 'admin@brightloop.com';
    if (role === 'STAFF') targetEmail = 'staff@brightloop.com';
    if (role === 'CUSTOMER') targetEmail = 'sarah@acmecorp.com';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: 'Password123!' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed.');

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid email or password.');

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isRegisterPasswordValid) {
      setError('Password must be at least 8 characters with 1 uppercase letter and 1 symbol.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          company: regCompany,
          role: 'CUSTOMER'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Decorative backdrop gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-indigo-600 items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-indigo-500/30">
            B
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Brightloop Software</h1>
          <p className="text-xs text-slate-400">Enterprise Subscription & Recurring Billing Portal</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100">
          
          {/* Tabs: Sign In vs Sign Up */}
          <div className="flex border-b border-slate-200 mb-6 text-xs font-bold">
            <button
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`flex-1 pb-3 text-center border-b-2 transition ${
                activeTab === 'login'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In to Account
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(''); }}
              className={`flex-1 pb-3 text-center border-b-2 transition ${
                activeTab === 'register'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Register Customer Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* SIGN IN TAB */}
          {activeTab === 'login' && (
            <div className="space-y-5">
              
              {/* Role Selector Badges & 1-Click Login */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Login Portal (Click to fill or instant login):
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleInstantLogin('ADMIN')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center justify-center gap-1 ${
                      selectedRole === 'ADMIN'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm">👑 Admin</span>
                    <span className="text-[10px] text-indigo-600 font-semibold">1-Click Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstantLogin('STAFF')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center justify-center gap-1 ${
                      selectedRole === 'STAFF'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm">💼 Staff</span>
                    <span className="text-[10px] text-blue-600 font-semibold">1-Click Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstantLogin('CUSTOMER')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center justify-center gap-1 ${
                      selectedRole === 'CUSTOMER'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm">🏢 Customer</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">1-Click Login</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2"
                >
                  {loading ? 'Authenticating...' : `Sign In as ${selectedRole}`}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Fill Credentials Pills */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Quick 1-Click Credentials:
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <button
                    onClick={() => quickFill('ADMIN')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                  >
                    Admin: admin@brightloop.com
                  </button>
                  <button
                    onClick={() => quickFill('CUSTOMER')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                  >
                    Customer: sarah@acmecorp.com
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REGISTER CUSTOMER TAB */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business / Company Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    placeholder="e.g. Apex Innovations Ltd"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="vikram@apexinnovations.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Password Criteria Checklist */}
                <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-700 mb-1">Required Security Standards:</div>
                  <div className={`flex items-center gap-1.5 ${pwLengthOk ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${pwLengthOk ? 'text-emerald-600' : 'text-slate-300'}`} />
                    Minimum 8 characters ({regPassword.length}/8+)
                  </div>
                  <div className={`flex items-center gap-1.5 ${pwUpperOk ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${pwUpperOk ? 'text-emerald-600' : 'text-slate-300'}`} />
                    At least one uppercase letter (A-Z)
                  </div>
                  <div className={`flex items-center gap-1.5 ${pwSpecialOk ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${pwSpecialOk ? 'text-emerald-600' : 'text-slate-300'}`} />
                    At least one special symbol (!@#$%^&*...)
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isRegisterPasswordValid || loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Account...' : 'Sign Up & Access Customer Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500">
          Brightloop Multi-Tenant Billing Platform • All currencies in INR (₹)
        </div>

      </div>

    </div>
  );
}
