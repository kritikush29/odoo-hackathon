import React, { useState } from 'react';
import {
  Layers, BarChart3, Package, Calendar, FileText,
  CreditCard, Tag, Percent, User, PlusCircle,
  ExternalLink, ChevronDown, Check, LogIn, Users, LogOut
} from 'lucide-react';

export default function Navbar({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onSwitchUser,
  onLogout
}) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isStaff = currentUser?.role === 'STAFF';
  const isCustomer = currentUser?.role === 'CUSTOMER';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs print:hidden">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(isCustomer ? 'customer-portal' : 'analytics')}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-indigo-200">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">Brightloop</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Billing Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">Subscription & Recurring Billing</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {!isCustomer && (
              <>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    activeTab === 'analytics'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" /> Finance Lead
                </button>

                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    activeTab === 'subscriptions'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4" /> Subscriptions
                </button>

                <button
                  onClick={() => setActiveTab('billing-day')}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    activeTab === 'billing-day'
                      ? 'bg-amber-50 text-amber-800 font-semibold border border-amber-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Billing Day
                </button>

                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    activeTab === 'invoices'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Invoices
                </button>

                <button
                  onClick={() => setActiveTab('payments')}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    activeTab === 'payments'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Payments
                </button>
              </>
            )}

            {/* Catalog & Admin Controls */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('admin-customers')}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    activeTab === 'admin-customers'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" /> Registered Customers
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    activeTab === 'products'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Package className="w-4 h-4" /> Products & Variants
                </button>

                <button
                  onClick={() => setActiveTab('plans')}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    activeTab === 'plans'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" /> Plans
                </button>

                <button
                  onClick={() => setActiveTab('discounts')}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    activeTab === 'discounts'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Percent className="w-4 h-4" /> Discounts
                </button>

                <button
                  onClick={() => setActiveTab('taxes')}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    activeTab === 'taxes'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Tag className="w-4 h-4" /> Taxes
                </button>
              </>
            )}

            {/* Customer Portal Link */}
            <button
              onClick={() => setActiveTab('customer-portal')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'customer-portal'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <ExternalLink className="w-4 h-4" /> Customer Portal
            </button>
          </nav>

          {/* User Profile & Account Switcher Dropdown */}
          <div className="flex items-center gap-3 relative">
            {isAdmin && (
              <button
                onClick={() => onOpenAuth('add-staff')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition"
              >
                <PlusCircle className="w-3.5 h-3.5" /> + Add Staff
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition border border-slate-200"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                  isAdmin ? 'bg-indigo-600' : isStaff ? 'bg-blue-600' : 'bg-emerald-600'
                }`}>
                  {currentUser?.name?.slice(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name}</div>
                  <div className="text-[10px] font-semibold text-slate-500">
                    {currentUser?.role === 'ADMIN' && 'Admin'}
                    {currentUser?.role === 'STAFF' && 'Staff'}
                    {currentUser?.role === 'CUSTOMER' && `Customer (${currentUser.company})`}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-800">{currentUser?.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{currentUser?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      {currentUser?.role}
                    </span>
                  </div>

                  <div className="px-2 py-1.5">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Switch Account</div>
                    
                    <button
                      onClick={() => { onSwitchUser('ADMIN'); setUserDropdownOpen(false); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-50 ${
                        isAdmin ? 'font-bold text-indigo-600' : 'text-slate-700'
                      }`}
                    >
                      <span>Elena Vance (Admin)</span>
                      {isAdmin && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>

                    <button
                      onClick={() => { onSwitchUser('STAFF'); setUserDropdownOpen(false); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-50 ${
                        isStaff ? 'font-bold text-blue-600' : 'text-slate-700'
                      }`}
                    >
                      <span>Marcus Brody (Staff)</span>
                      {isStaff && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>

                    <button
                      onClick={() => { onSwitchUser('CUSTOMER'); setUserDropdownOpen(false); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-50 ${
                        isCustomer ? 'font-bold text-emerald-600' : 'text-slate-700'
                      }`}
                    >
                      <span>Sarah Chen (Acme Corp)</span>
                      {isCustomer && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1 px-2 space-y-0.5">
                    <button
                      onClick={() => { onLogout(); setUserDropdownOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      Sign Out (Return to Login Page)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Quick Sign Out Button */}
            <button
              onClick={onLogout}
              title="Return to Login Page"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Nav */}
      <div className="lg:hidden flex overflow-x-auto gap-1 p-2 bg-slate-50 border-t border-slate-200 text-xs font-medium no-scrollbar">
        {!isCustomer && (
          <>
            <button onClick={() => setActiveTab('analytics')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Finance Lead</button>
            <button onClick={() => setActiveTab('subscriptions')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'subscriptions' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Subscriptions</button>
            <button onClick={() => setActiveTab('billing-day')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'billing-day' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>Billing Day</button>
            <button onClick={() => setActiveTab('invoices')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'invoices' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Invoices</button>
            <button onClick={() => setActiveTab('payments')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'payments' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Payments</button>
          </>
        )}
        {isAdmin && (
          <>
            <button onClick={() => setActiveTab('admin-customers')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'admin-customers' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Customers & Invoices</button>
            <button onClick={() => setActiveTab('products')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'products' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Products</button>
            <button onClick={() => setActiveTab('plans')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'plans' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Plans</button>
            <button onClick={() => setActiveTab('discounts')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'discounts' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Discounts</button>
            <button onClick={() => setActiveTab('taxes')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'taxes' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Taxes</button>
          </>
        )}
        <button onClick={() => setActiveTab('customer-portal')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'customer-portal' ? 'bg-emerald-600 text-white' : 'text-emerald-700'}`}>Customer Portal</button>
        <button onClick={onLogout} className="px-2.5 py-1.5 rounded-lg whitespace-nowrap text-rose-600 hover:bg-rose-50 font-semibold">Sign Out</button>
      </div>
    </header>
  );
}
