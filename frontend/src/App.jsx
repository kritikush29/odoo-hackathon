import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import FinanceDashboard from './components/FinanceDashboard.jsx';
import ProductsView from './components/ProductsView.jsx';
import PlansView from './components/PlansView.jsx';
import QuotationTemplatesView from './components/QuotationTemplatesView.jsx';
import SubscriptionsView from './components/SubscriptionsView.jsx';
import BillingDayView from './components/BillingDayView.jsx';
import InvoicesView from './components/InvoicesView.jsx';
import PaymentsView from './components/PaymentsView.jsx';
import DiscountRulesView from './components/DiscountRulesView.jsx';
import TaxRulesView from './components/TaxRulesView.jsx';
import CustomerPortalView from './components/CustomerPortalView.jsx';
import PrintableInvoiceModal from './components/PrintableInvoiceModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import LoginPage from './components/LoginPage.jsx';
import AdminCustomersView from './components/AdminCustomersView.jsx';

export default function App() {
  // Current user state with localStorage persistence - defaults to null to show separate login page
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('brightloop_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [activeTab, setActiveTab] = useState('analytics');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [invoiceForPayment, setInvoiceForPayment] = useState(null);
  const [templateToLoad, setTemplateToLoad] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const updateUser = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('brightloop_user', JSON.stringify(user));
    } catch (e) {}
  };

  const handleSwitchUser = (role) => {
    let nextUser;
    if (role === 'ADMIN') {
      nextUser = {
        id: 'USR-001',
        name: 'Elena Vance',
        email: 'admin@brightloop.com',
        role: 'ADMIN',
        company: 'Brightloop HQ'
      };
      setActiveTab('analytics');
      showToast('Switched account: Elena Vance (Admin)');
    } else if (role === 'STAFF') {
      nextUser = {
        id: 'USR-002',
        name: 'Marcus Brody',
        email: 'staff@brightloop.com',
        role: 'STAFF',
        company: 'Brightloop Operations'
      };
      setActiveTab('subscriptions');
      showToast('Switched account: Marcus Brody (Staff)');
    } else if (role === 'CUSTOMER') {
      nextUser = {
        id: 'USR-003',
        name: 'Sarah Chen',
        email: 'sarah@acmecorp.com',
        role: 'CUSTOMER',
        company: 'Acme Corp'
      };
      setActiveTab('customer-portal');
      showToast('Switched account: Sarah Chen (Customer Portal)');
    }
    updateUser(nextUser);
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset all databases, subscriptions, invoices and payments to fresh demo seed state?')) return;
    try {
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      if (res.ok) {
        showToast('Demo data reset to clean initial seed state.');
        window.location.reload();
      }
    } catch (e) {
      alert('Reset failed: ' + e.message);
    }
  };

  const handleUseTemplate = (template) => {
    setTemplateToLoad(template);
    setActiveTab('subscriptions');
    showToast(`Loaded quotation template '${template.name}'.`);
  };

  const handleRecordPaymentRequest = (invoice) => {
    setInvoiceForPayment(invoice);
    setActiveTab('payments');
  };

  const handleChaseInvoice = async (invoiceId) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/chase`, { method: 'POST' });
      const data = await res.json();
      showToast(data.message);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('brightloop_user');
    } catch (e) {}
    showToast('Signed out. Redirected to Login Page.');
  };

  const handleLoginSuccess = (user) => {
    updateUser(user);
    if (user.role === 'CUSTOMER') {
      setActiveTab('customer-portal');
    } else if (user.role === 'STAFF') {
      setActiveTab('subscriptions');
    } else {
      setActiveTab('admin-customers');
    }
    showToast(`Signed in as ${user.name} (${user.role})`);
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const isStaff = currentUser?.role === 'STAFF';
  const isCustomer = currentUser?.role === 'CUSTOMER';

  // Render standalone Login Page if no user is signed in
  if (!currentUser) {
    return (
      <div className="relative min-h-screen">
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={handleOpenAuth}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
      />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'analytics' && (
          <FinanceDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onPreviewInvoice={(inv) => setPreviewInvoice(inv)}
            onChaseInvoice={handleChaseInvoice}
          />
        )}

        {activeTab === 'admin-customers' && (
          <AdminCustomersView
            onPreviewInvoice={(inv) => setPreviewInvoice(inv)}
          />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionsView
            onPreviewInvoice={(inv) => setPreviewInvoice(inv)}
            templateToLoad={templateToLoad}
            clearLoadedTemplate={() => setTemplateToLoad(null)}
          />
        )}

        {activeTab === 'billing-day' && (
          <BillingDayView
            onPreviewInvoice={(inv) => setPreviewInvoice(inv)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesView
            onPreviewInvoice={(inv) => setPreviewInvoice(inv)}
            onRecordPayment={handleRecordPaymentRequest}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsView
            selectedInvoiceForPayment={invoiceForPayment}
            clearSelectedInvoice={() => setInvoiceForPayment(null)}
            onPreviewInvoice={(inv) => setPreviewInvoice(inv)}
          />
        )}

        {activeTab === 'products' && (
          <ProductsView isAdmin={isAdmin} />
        )}

        {activeTab === 'plans' && (
          <PlansView isAdmin={isAdmin} />
        )}

        {activeTab === 'quotation-templates' && (
          <QuotationTemplatesView
            onUseTemplate={handleUseTemplate}
            isAdmin={isAdmin}
            isStaff={isStaff}
          />
        )}

        {activeTab === 'discounts' && (
          <DiscountRulesView isAdmin={isAdmin} />
        )}

        {activeTab === 'taxes' && (
          <TaxRulesView isAdmin={isAdmin} />
        )}

        {activeTab === 'customer-portal' && (
          <CustomerPortalView
            currentUser={currentUser}
            onPreviewInvoice={(inv) => setPreviewInvoice(inv)}
            onRecordPayment={handleRecordPaymentRequest}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Brightloop Software</span>
            <span>• Enterprise Subscription & Recurring Billing Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>SLA Response: &lt; 2s</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PrintableInvoiceModal
        invoice={previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        onRecordPayment={(inv) => {
          setPreviewInvoice(null);
          handleRecordPaymentRequest(inv);
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          updateUser(user);
          if (user.role === 'CUSTOMER') setActiveTab('customer-portal');
          showToast(`Logged in as ${user.name} (${user.role})`);
        }}
        mode={authModalMode}
      />
    </div>
  );
}

