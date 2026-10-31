📖 Overview

The Brightloop Subscription Management System is a unified software platform designed to act as the digital backbone for recurring revenue businesses. It automates the complete lifecycle of a subscription business—from setting up products and plans to generating quotes, sending automated invoices, collecting payments, and reporting revenue.

Built to replace error-prone manual spreadsheets, this platform ensures no renewals are missed, no invoices are skipped, and finance teams have real-time visibility into the company's financial health.

✨ Core Features

🔐 Role-Based Access Control (RBAC) & Dedicated Auth
- Strict Auth Policies: Passwords require >=8 characters, at least 1 uppercase letter, and at least 1 special symbol.
- Separate Login & Signup Page for Admin, Staff, and Customer with 1-click test pills.
- Admin: Full system control, manages staff, creates tax rules, discount policies, and monitors all registered customers and generated invoice counts.
- Internal Staff: Manages day-to-day customer operations, quotes, and subscriptions with restricted access.
- Customer Portal: A self-serve interface for customers to view active subscriptions, toggle add-ons, on-demand **Generate Invoice**, and **Print Invoice** in INR (₹).

📦 Catalog & Plan Engine
- Variant Products: Support for base products and add-ons with pricing variants (e.g., brand selections automatically adjusting the base price in ₹).
- Flexible Plans: Customizable billing frequencies (daily, weekly, monthly, yearly) and behaviors (auto-closing, renewals).

🔄 Quote-to-Cash Pipeline
- Quotation Templates: Quick-start offers with pre-configured plans, products, and expiration dates.
- Subscription State Machine: Seamless transitions from Draft ➔ Quotation ➔ Confirmed ➔ Active ➔ Closed.

🧾 Automated Billing & Invoicing
- Billing Day Automation: Automatically generates invoices simultaneously based on active subscriptions without duplicates or skips.
- Dynamic Taxes & Discounts: Auto-calculates tax rules and applies complex discount rules (fixed/percentage, min-purchase limits) to invoices.
- Invoice Lifecycle: Tracks invoices through Draft ➔ Confirmed ➔ Paid with print preview dialogs.

📊 Finance Dashboard & Performance
- Real-Time Analytics: Single pane of glass for active subscriptions, total revenue, collected payments, and overdue invoices.
- All Currencies in Indian Rupees (₹).
- High Performance: Loads in under two seconds SLA.

🛠️ Tech Stack & Architecture

- **Frontend & Web Platform (`frontend/`):** React 19, Tailwind CSS v4, Lucide Icons, Vite, and Express.js
- **Backend Services (`backend/`):** Python (FastAPI), SQLAlchemy, PostgreSQL, Redis + Celery
- **Currency:** Indian Rupees (₹)
- **Security:** Strict password rules (min 8 chars, 1 uppercase, 1 symbol)

### Quick Run (Frontend & Web Platform)
```bash
cd frontend
npm install
npm run build
npm start
# Server runs on http://localhost:5000
```
