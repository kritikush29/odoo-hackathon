# Brightloop Frontend & Full-Stack Platform

A unified subscription management and recurring billing platform built with React 19, Tailwind CSS v4, Vite, and an Express.js backend engine.

## ✨ Key Capabilities

1. **Role-Based Access Control & Dedicated Login Page**
   - Distinct portals for **Admin**, **Staff**, and **Customer** with 1-click test credentials.
   - Enforced password policy: minimum 8 characters, at least 1 uppercase letter (`A-Z`), and at least 1 special character (`!@#$%^&*...`).
   - Customer self-registration with live criteria validation.

2. **Customer Self-Service Portal**
   - **Generate Invoice:** Customers can generate official billing invoices on demand from active subscriptions.
   - **Print Invoice:** Direct browser print dialog and printable invoice modal in Indian Rupees (`₹`).
   - Real-time add-on toggling and subscription status tracking.

3. **Admin Registered Customers & Invoices Directory**
   - Live directory of all registered customers on the website.
   - Exact count of **No. of Invoices Generated** per customer.
   - Total billed amount in INR (`₹`) and full customer invoice inspection and printing.

4. **Automated Recurring Billing Engine ("Billing Day")**
   - Single-click automated invoice generation across all active subscriptions due on or before target date.
   - Duplicate prevention guards and auto-advancement of billing cycles (daily, weekly, monthly, yearly).

5. **Finance Lead Analytics & KPI Dashboard**
   - Real-time MRR, ARR, cash collected, and overdue invoice alerts.
   - Sub-2-second response time SLA.
   - All currencies strictly formatted in Indian Rupees (`₹`).

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
Runs both the Express backend API and the Vite frontend concurrently:
```bash
npm run dev
```

### 3. Production Build & Run
```bash
npm run build
npm start
```
The full application will be accessible at `http://localhost:5000`.

## 🔑 Demo Credentials
- **Admin:** `admin@brightloop.com` / `Password123!`
- **Staff:** `staff@brightloop.com` / `Password123!`
- **Customer:** `sarah@acmecorp.com` / `Password123!`
