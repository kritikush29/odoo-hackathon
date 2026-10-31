import React, { useState } from 'react';
import { X, Lock, Mail, User, Building, AlertCircle, CheckCircle2, KeyRound, Shield, Check } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  mode = 'login' // 'login', 'register', 'forgot', 'add-staff'
}) {
  const [activeTab, setActiveTab] = useState(mode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetResult, setResetResult] = useState(null);

  if (!isOpen) return null;

  // Real-time password criteria validation: min 8 chars, 1 uppercase, 1 symbol
  const pwLengthOk = password.length >= 8;
  const pwUpperOk = /[A-Z]/.test(password);
  const pwSpecialOk = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = pwLengthOk && pwUpperOk && pwSpecialOk;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to login');
      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (e, forcedRole = 'CUSTOMER') => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!isPasswordValid) {
      setError('Password must be at least 8 characters with 1 uppercase letter and 1 symbol.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          company,
          role: forcedRole,
          requesterRole: currentUser?.role || 'CUSTOMER'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      if (forcedRole === 'STAFF') {
        setSuccessMsg(`New staff member ${name} created successfully!`);
        setName('');
        setEmail('');
        setPassword('');
      } else {
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetResult(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset request failed');
      setResetResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              B
            </div>
            <span className="font-bold text-slate-800 text-sm">
              {activeTab === 'login' && 'Sign in to Brightloop'}
              {activeTab === 'register' && 'Create Customer Account'}
              {activeTab === 'forgot' && 'Reset Password'}
              {activeTab === 'add-staff' && 'Add Internal Staff Member'}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@brightloop.com or customer@company.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
              >
                Sign In
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">Need a customer account? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* REGISTER CUSTOMER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={(e) => handleRegister(e, 'CUSTOMER')} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rachel Adams"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Apex Tech Solutions"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rachel@apextech.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                    placeholder="e.g. Brightloop2026!"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Password Policy Requirements */}
                <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-700 mb-1">Password Requirements:</div>
                  <div className={`flex items-center gap-1.5 ${pwLengthOk ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${pwLengthOk ? 'text-emerald-600' : 'text-slate-300'}`} />
                    Minimum 8 characters ({password.length}/8+)
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
                disabled={!isPasswordValid}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition shadow-sm"
              >
                Sign Up & Open Portal
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {activeTab === 'forgot' && (
            <div className="space-y-4">
              {!resetResult ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Enter your registered email address to receive a secure password reset link.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your-email@company.com"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
                  >
                    Send Password Reset Link
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Reset Email Dispatched!
                  </div>
                  <p>{resetResult.message}</p>
                  <div className="p-2.5 bg-white rounded-lg border border-emerald-300 font-mono text-[11px] break-all text-slate-700">
                    {resetResult.resetLink}
                  </div>
                  <button
                    onClick={() => { setResetResult(null); setActiveTab('login'); }}
                    className="w-full py-2 mt-2 bg-emerald-700 text-white font-medium rounded-lg text-xs hover:bg-emerald-800"
                  >
                    Return to Login
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ADMIN: ADD STAFF MEMBER */}
          {activeTab === 'add-staff' && (
            <form onSubmit={(e) => handleRegister(e, 'STAFF')} className="space-y-3.5">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Admin privilege: Registering an internal operations staff member.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Member Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jason Blake"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jason@brightloop.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Temporary Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isPasswordValid}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition shadow-sm"
              >
                Create Staff Account
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
