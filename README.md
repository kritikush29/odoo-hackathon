📖 Overview

The Brightloop Subscription Management System is a unified software platform designed to act as the digital backbone for recurring revenue businesses. It automates the complete lifecycle of a subscription business—from setting up products and plans to generating quotes, sending automated invoices, collecting payments, and reporting revenue.

Built to replace error-prone manual spreadsheets, this platform ensures no renewals are missed, no invoices are skipped, and finance teams have real-time visibility into the company's financial health.

✨ Core Features

🔐 Role-Based Access Control (RBAC)

Strict Auth Policies: 1 Email = 1 Account. Passwords require >8 characters, mixed case, and special characters. Includes secure email password resets.

Admin: Full system control, manages staff, creates tax rules, and discount policies.

Internal Staff: Manages day-to-day customer operations, quotes, and billing with restricted access.

Customer Portal: A self-serve interface for customers to view and manage their active subscriptions and invoices.

📦 Catalog & Plan Engine

Variant Products: Support for base products and add-ons with pricing variants (e.g., specific brand selections automatically adjusting the base price).

Flexible Plans: Customizable billing frequencies (daily, weekly, monthly, yearly) and behaviors (auto-closing, manual pause, early closure, or renewals).

🔄 Quote-to-Cash Pipeline

Quotation Templates: Quick-start offers with pre-configured plans, products, and expiration dates.

Subscription State Machine: Seamless transitions from Draft ➔ Quotation ➔ Confirmed ➔ Active ➔ Closed.

🧾 Automated Billing & Invoicing

Billing Day Automation: Automatically generates hundreds of invoices simultaneously based on active subscriptions without duplicates or skips.

Dynamic Taxes & Discounts: Auto-calculates admin-defined tax rules. Applies complex discount rules (fixed/percentage, min-purchase limits, usage limits) to the next invoice automatically.

Invoice Lifecycle: Tracks invoices through Draft ➔ Confirmed ➔ Paid.

📊 Finance Dashboard & Performance

Real-Time Analytics: Single pane of glass for active subscriptions, total revenue, collected payments, and overdue invoices.

High Performance: Optimized database queries and architecture ensure the entire system—especially reporting dashboards—loads in under two seconds, even with thousands of active records.

🛠️ Tech Stack (Example/Placeholder)

Frontend: React.js / Next.js / Tailwind CSS

Backend:  Python (FastAPI)

Database: PostgreSQL (for relational data integrity)

Caching & Background Jobs: Redis + Celery )