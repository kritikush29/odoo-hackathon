# Brightloop: frontend agent context

You are helping the FRONTEND developer on Brightloop, a subscription management and recurring billing platform built for a hackathon. Read this file fully before making changes. Follow it over any default habit.

## 1. Role and boundaries

- The user owns `/frontend` only. A teammate owns `/backend` (FastAPI, PostgreSQL, Redis, Celery).
- Never edit, create or delete files in `/backend`.
- The only server code you may write is the thin layer that serves the frontend: Next.js route handlers for auth cookies, an API proxy, and middleware. Details in section 5.
- The real data source is the FastAPI backend. Until it is ready, the app runs against an MSW mock API. Never ship hardcoded JSON as a data source.
- The user is a student who must explain every file to hackathon judges. Keep code small, readable and consistent. Comment only non-obvious logic. Do not add libraries without saying why.

## 2. Product in one paragraph

Brightloop sells software on subscription. Four roles use it: admin (full control, taxes, discounts, staff), staff (customers, quotes, subscriptions, invoices, payments), customer (self-service portal), finance lead (uses the admin dashboard). Core flow: product and plan setup, quotation template, subscription (Draft, Quotation, Confirmed, Active, Closed), billing-day invoice generation (Draft, Confirmed, Paid, overdue derived from due date), payments, finance reporting. Currency is INR, taxes are GST (CGST and SGST for same state, IGST for inter-state). Customers pay by UPI, Net Banking or Card.

## 3. Stack

- Next.js App Router, TypeScript, React, Tailwind CSS
- GSAP with `@gsap/react` (`useGSAP`) and ScrollTrigger for animation
- TanStack Query (data) and TanStack Table (tables)
- React Hook Form with Zod (forms and validation)
- Phosphor icons, regular weight
- MSW with faker for the dev mock API
- openapi-typescript to generate types from FastAPI `/openapi.json` when available
- Fonts through `next/font`

## 4. Folder structure

```
frontend/
  app/
    layout.tsx, page.tsx (landing), login/, forgot-password/
    admin/ (layout, dashboard, products, discounts-taxes, team)
    staff/ (layout, dashboard, customers, subscriptions, invoices)
    customer/ (layout, dashboard, subscriptions, billing)
    api/auth/ (login, logout, session)
    api/proxy/[...path]/route.ts
  components/ui/       Button, Chip, Field, Drawer, Dialog, DataTable, Stepper, KPI, EmptyState, ErrorState, TopProgress
  components/motion/   WordReveal, CountUp, Float, LifecycleLine, BillingLoop
  lib/                 api, auth, format, gsap, schemas
  mocks/               browser.ts, handlers.ts, store.ts, factories.ts
  hooks/               useSubscriptions, useInvoices, useBillingJob, ...
  middleware.ts
  .env.example
```

## 5. The small server layer (allowed)

1. `POST /api/auth/login` calls FastAPI `/auth/login` and stores the JWT in an httpOnly, secure cookie. `POST /api/auth/logout` clears it. `GET /api/auth/session` returns user and role.
2. `app/api/proxy/[...path]/route.ts` forwards requests to `NEXT_PUBLIC_API_URL` and adds the cookie token as a Bearer header.
3. `middleware.ts` redirects by role: admin to `/admin`, staff to `/staff`, customer to `/customer`, unauthenticated users to `/login`.
4. Mock API: MSW, enabled by `NEXT_PUBLIC_USE_MOCK=true`. It generates 2,000+ subscriptions, 5,000+ invoices, customers, plans and payments at runtime with faker, in an in-memory store that supports create, update, filter, sort and pagination. No static JSON files. Handlers must match the API contract exactly so switching to FastAPI is one env change.
5. Typed API client in `lib/api`. All errors use one shape: `{ message, fieldErrors }`.

## 6. API contract (mock and FastAPI must both follow it)

- Lists accept `page`, `page_size`, `sort`, `order`, `q` and filters. They return `{ items, total, page, page_size }`.
- `POST /auth/signup`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`; `GET /auth/me`. Duplicate email returns 409.
- `GET/POST/PATCH /products`, `/products/{id}/variants`, `/plans`, `/quotation-templates`
- `GET/POST/PATCH /subscriptions`; `POST /subscriptions/{id}/transition` with `{ to }`; `POST /subscriptions/from-template`
- `GET/POST /customers`
- `GET /invoices`, `GET /invoices/{id}`, `POST /invoices/{id}/transition` with `{ to }`, `POST /invoices/{id}/send`
- `POST /billing/run` returns `{ job_id }`. `GET /billing/jobs/{id}` returns `{ status, created, skipped, failed: [{ subscription, reason }] }`. Billing day is a Celery job: start it, then poll every second until done. Re-running must show items as skipped, never created twice.
- `GET/POST /payments` with method (UPI, NetBanking, Card, Cash, Bank), amount, date, note, invoice_id
- `GET/POST/PATCH /taxes`, `GET/POST/PATCH /discounts`
- `GET/POST/DELETE /staff` (admin only)
- `GET /reports/summary?from=&to=` returns active subscriptions, revenue, collected, outstanding, overdue count, and a revenue time series. `GET /reports/overdue` is paginated.

If you need an endpoint that is not listed, add it to this section and to the mock, and tell the user so they can tell the backend teammate.

## 7. Design system (follow exactly)

Mood: a calm, warm editorial ledger with playful motion. Animation quality is inspired by chargebee.com but must not copy it.

Colors (define as Tailwind theme tokens, never hardcode hex in components):

| Token | Value |
|---|---|
| paper (page) | #F3EFE6 |
| surface | #FAF7F0 (never pure white) |
| sand (feature panels) | #E6D9B8 |
| border | #D9D3C4, 1px |
| ink | #1C211F |
| muted | #5E655F |
| primary (deep green) | #0F4C45 |
| accent (terracotta, sparingly) | #C0532D |
| active, paid | #2F6B3A |
| confirmed | #2C4A6B |
| draft, closed | #7A7A72 |
| paused, warning | #A87B1E |
| overdue, error | #A3321F |

Shapes: no crisp rectangles and no uniform soft radius.
- Arch: `border-radius: 170px 170px 26px 26px` for hero and feature panels.
- Circle: loops and avatars.
- Leaf: `border-radius: 22px 4px 22px 4px` for buttons, cards, chips, inputs, table containers. Table rows use `14px 3px 14px 3px`.

Depth: 1px borders and tonal surface changes only.

Fonts: Bricolage Grotesque (headings), Instrument Sans (body), IBM Plex Mono with tabular numbers for money, invoice numbers and subscription numbers.

Copy: short and sparse. Lead with visuals, numbers and motion. Sentence case. No em dashes anywhere, in UI text or code comments.

Status: leaf-cornered chips in the status colors. Lifecycles are shown as a horizontal node line with the current node filled.
- Subscription: Draft, Quotation, Confirmed, Active, Closed
- Invoice: Draft, Confirmed, Paid, plus derived Overdue

### Never use

Gradients, drop shadows, glass or blur, emojis, em dashes, Lucide icons, Inter, Geist, Space Grotesk, pure white backgrounds, rainbow colors, neon colors, basic pastels, purple and black, radial orbs, dot grids, sparkle icons, colored left stripes, checkmark bullets, three feature cards in a row, three-tier pricing cards, fake testimonials, terminal windows, "it's not X, it's Y" copy, skeleton loaders, soft uniform corner radius.

Use a thin green top progress bar plus fade-in instead of skeletons. If a library component ships with shadows, rounded-lg corners or Lucide icons, restyle it to the tokens above before using it.

## 8. Motion rules (GSAP)

- Durations 150 to 800ms, ease `power3.out`. Respect `prefers-reduced-motion`. Always use `useGSAP` so animations clean up.
- Landing and login: headline words slide up from a mask; floating cards drift on a sine yoyo; a terracotta dot orbits a dashed billing loop; a cycling invoice card (Draft, Confirmed, Paid) with a counting recurring revenue number; stat band counts up on scroll; the lifecycle line draws itself with ScrollTrigger and fills each node.
- Landing billing demo uses the real hooks: `POST /billing/run`, poll the job, animate rows as results arrive. A second run shows every row as "Already billed".
- App screens animate state changes only: KPI count-up on load, staggered table rows on filter change, sliding active indicator in the sidebar, drawers sliding in, chips popping with a small scale when status changes. Keep it calm because staff use these screens all day.
- Lazy-load GSAP plugins and chart libraries.

## 9. Pages

Public and auth
- `app/page.tsx`: landing with arch hero and billing loop, stat band, lifecycle line, billing demo, plans comparison from `GET /plans` with a billing-period switch (no three-tier cards), short FAQ, one-line footer.
- `app/login/page.tsx`: sign in and sign up in one animated portal. Live password rules (more than 8 characters, uppercase, lowercase, special character), each met rule gets a filled circle. Inline "email already registered" error from the 409.
- `app/forgot-password/page.tsx`: email form, sent state, reset form reached from the emailed link.

Admin and finance (`app/admin/layout.tsx`, animated sidebar)
- `dashboard`: four KPI tiles (active subscriptions, revenue in INR, incoming payments, overdue invoices), revenue chart in green with outstanding in terracotta, overdue table with days overdue, date range filter, summary and detail toggle.
- `products`: product list and form (name, type, sales price, cost price, notes), variants (brand with price delta, for example Odoo adds 560), plan builder (period, minimum quantity, availability dates, toggles for auto-close, closable, pausable, renewable).
- `discounts-taxes`: GST rule manager, discount form (fixed or percent, minimums, dates, usage limit, scope product or subscription) with a live preview of the next invoice.
- `team`: staff table with add and remove and a confirm dialog.

Staff (`app/staff/layout.tsx`)
- `dashboard`: pending quotes, recent sign-ups, urgent overdue invoices.
- `customers`: directory with search, filters, detail drawer.
- `subscriptions`: pipeline with status chips and table or board toggle, detail page with five-node stepper, lines table (product, quantity, unit price, tax, amount), totals block, create-from-quotation-template flow.
- `invoices`: status-filtered list, detail with Confirm, Cancel, Send, Print (print stylesheet), "Run billing day" with live job progress and summary, payment recording panel (method, amount, date, note).

Customer (`app/customer/layout.tsx`, bottom navigation on mobile)
- `dashboard`: active plans, next renewal dates, outstanding balance.
- `subscriptions`: plan details, add-on toggles, cancel or pause where the plan allows.
- `billing`: invoice history and a slide-out panel to pay GST invoices by UPI, Net Banking or Card, with validation and a success state.

Shared: `app/layout.tsx` holds fonts, `QueryClientProvider`, MSW bootstrap and `TopProgress`. Admin and staff layouts include a Ctrl+K command palette.

## 10. Quality rules (the hackathon is judged on these)

- Every list: server-side pagination, designed empty state, error state with retry, top progress bar instead of skeletons.
- Every form: Zod validation for empty, malformed and unexpected input, inline error text, no crashes, double-submit protection.
- Responsive down to 360px. Tables become stacked rows, sidebars become a bottom bar, drawers become full-screen sheets.
- Every page loads in under 2 seconds with thousands of records. Never load a full list on the client. Memoize heavy tables.
- Accessible basics: visible focus states, labels on every input, sufficient contrast, keyboard-friendly dialogs.

## 11. Git workflow

- Feature branches: `feat/auth`, `feat/staff-invoices`, `feat/admin-dashboard`, and so on. Never commit straight to `main`.
- Conventional commits: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`. One logical change per commit.
- After each completed step, suggest a commit message.
- Never commit `.env` files, secrets or `node_modules`.

## 12. Build order

1. Tailwind tokens, fonts, ui components, motion components
2. Typed API client, MSW store and handlers, auth route handlers, middleware
3. login, forgot-password, role layouts
4. staff subscriptions and invoices with billing day job polling
5. admin dashboard, products, discounts-taxes, team
6. customer pages
7. landing page animation polish

After each step, list the files you created and the command to run them. If a requirement is unclear, make the most reasonable decision, state it in one line, and keep going. Do not stop to ask unless the choice would be expensive to undo.

## 13. How to run

```
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

`.env.local` values:
- `NEXT_PUBLIC_USE_MOCK=true` runs against the MSW mock.
- `NEXT_PUBLIC_API_URL=http://localhost:8000` points to the real FastAPI when `NEXT_PUBLIC_USE_MOCK=false`.
