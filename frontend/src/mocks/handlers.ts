/**
 * MSW request handlers.
 * Intercepts /api/mock/* requests and serves data from the in-memory store.
 * Matches the API contract exactly so switching to FastAPI is one env change.
 */

import { http, HttpResponse, delay } from "msw";
import { store } from "./store";
import type { BillingJob } from "./store";

const BASE = "/api/mock";

/** Extract pagination and filter params from a URL */
function getParams(url: string) {
  const u = new URL(url);
  return {
    page: Number(u.searchParams.get("page")) || 1,
    page_size: Number(u.searchParams.get("page_size")) || 20,
    sort: u.searchParams.get("sort") || undefined,
    order: u.searchParams.get("order") || undefined,
    q: u.searchParams.get("q") || undefined,
    // Collect all other params as filters
    filters: Object.fromEntries(
      [...u.searchParams.entries()].filter(
        ([k]) => !["page", "page_size", "sort", "order", "q"].includes(k)
      )
    ),
  };
}

export const handlers = [
  /* ═══════════════════ AUTH ═══════════════════ */

  http.post(`${BASE}/auth/login`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { email: string; password: string };
    const user = store.users.find(
      (u) => u.email === body.email && u.password === body.password
    );
    if (!user) {
      return HttpResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }
    // In mock mode, we store the user ID in a simple way
    // The real auth uses JWT cookies via Next.js route handlers
    return HttpResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }),

  http.post(`${BASE}/auth/signup`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as {
      name: string;
      email: string;
      password: string;
    };

    if (store.users.find((u) => u.email === body.email)) {
      return HttpResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    const newUser = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      role: "customer" as const,
      password: body.password,
      state: "Maharashtra",
      createdAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    return HttpResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  }),

  http.get(`${BASE}/auth/me`, async () => {
    await delay(100);
    // In mock mode, return the admin user by default
    const admin = store.users.find((u) => u.role === "admin")!;
    return HttpResponse.json({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  }),

  http.post(`${BASE}/auth/forgot-password`, async () => {
    await delay(500);
    return HttpResponse.json({ message: "Reset link sent" });
  }),

  http.post(`${BASE}/auth/reset-password`, async () => {
    await delay(500);
    return HttpResponse.json({ message: "Password updated" });
  }),

  /* ═══════════════════ PRODUCTS ═══════════════════ */

  http.get(`${BASE}/products`, ({ request }) => {
    const params = getParams(request.url);
    const result = store.paginate(
      store.products as unknown as Record<string, unknown>[],
      params
    );
    return HttpResponse.json(result);
  }),

  http.post(`${BASE}/products`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const product = {
      id: crypto.randomUUID(),
      name: String(body.name),
      type: String(body.type),
      salesPrice: Number(body.salesPrice),
      costPrice: Number(body.costPrice),
      notes: String(body.notes || ""),
      createdAt: new Date().toISOString(),
    };
    store.products.push(product);
    return HttpResponse.json(product, { status: 201 });
  }),

  http.get(`${BASE}/products/:id/variants`, ({ params }) => {
    const variants = store.variants.filter(
      (v) => v.productId === params.id
    );
    return HttpResponse.json({ items: variants, total: variants.length });
  }),

  http.post(`${BASE}/products/:id/variants`, async ({ params, request }) => {
    const body = (await request.json()) as { brand: string; priceDelta: number };
    const variant = {
      id: crypto.randomUUID(),
      productId: params.id as string,
      brand: body.brand,
      priceDelta: body.priceDelta,
    };
    store.variants.push(variant);
    return HttpResponse.json(variant, { status: 201 });
  }),

  /* ═══════════════════ PLANS ═══════════════════ */

  http.get(`${BASE}/plans`, ({ request }) => {
    const params = getParams(request.url);
    const result = store.paginate(
      store.plans as unknown as Record<string, unknown>[],
      params
    );
    return HttpResponse.json(result);
  }),

  http.post(`${BASE}/plans`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const plan = {
      id: crypto.randomUUID(),
      name: String(body.name),
      productId: String(body.productId),
      period: body.period as "daily" | "weekly" | "monthly" | "yearly",
      price: Number(body.price),
      minQty: Number(body.minQty),
      availableFrom: String(body.availableFrom),
      availableTo: body.availableTo ? String(body.availableTo) : null,
      autoClose: Boolean(body.autoClose),
      closable: Boolean(body.closable),
      pausable: Boolean(body.pausable),
      renewable: Boolean(body.renewable),
    };
    store.plans.push(plan);
    return HttpResponse.json(plan, { status: 201 });
  }),

  /* ═══════════════════ QUOTATION TEMPLATES ═══════════════════ */

  http.get(`${BASE}/quotation-templates`, () => {
    return HttpResponse.json({
      items: store.quotationTemplates,
      total: store.quotationTemplates.length,
    });
  }),

  /* ═══════════════════ SUBSCRIPTIONS ═══════════════════ */

  http.get(`${BASE}/subscriptions`, ({ request }) => {
    const params = getParams(request.url);
    const result = store.paginate(
      store.subscriptions as unknown as Record<string, unknown>[],
      params
    );
    return HttpResponse.json(result);
  }),

  http.get(`${BASE}/subscriptions/:id`, ({ params }) => {
    const sub = store.subscriptions.find((s) => s.id === params.id);
    if (!sub)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(sub);
  }),

  http.post(`${BASE}/subscriptions/:id/transition`, async ({ params, request }) => {
    const body = (await request.json()) as { to: string };
    const sub = store.subscriptions.find((s) => s.id === params.id);
    if (!sub)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    sub.status = body.to as typeof sub.status;
    return HttpResponse.json(sub);
  }),

  http.post(`${BASE}/subscriptions/from-template`, async ({ request }) => {
    const body = (await request.json()) as {
      templateId: string;
      customerId: string;
    };
    const template = store.quotationTemplates.find(
      (t) => t.id === body.templateId
    );
    if (!template)
      return HttpResponse.json({ message: "Template not found" }, { status: 404 });

    const plan = store.plans.find((p) => p.id === template.planId)!;
    const customer = store.users.find((u) => u.id === body.customerId)!;
    const product = store.products.find((p) => p.id === plan.productId)!;

    const sub = {
      id: crypto.randomUUID(),
      number: `SUB-${String(store.subscriptions.length + 1).padStart(4, "0")}`,
      customerId: customer.id,
      customerName: customer.name,
      planId: plan.id,
      planName: plan.name,
      startDate: new Date().toISOString(),
      expiryDate: new Date(
        Date.now() + template.validDays * 24 * 60 * 60 * 1000
      ).toISOString(),
      paymentTerms: "Net 30",
      status: "Quotation" as const,
      lines: template.lines.map((l) => ({
        id: crypto.randomUUID(),
        productId: l.productId,
        productName: product.name,
        quantity: l.quantity,
        unitPrice: plan.price,
        taxRate: 18,
        amount: l.quantity * plan.price * 1.18,
      })),
      subtotal: template.lines.reduce((s, l) => s + l.quantity * plan.price, 0),
      taxTotal:
        template.lines.reduce((s, l) => s + l.quantity * plan.price, 0) * 0.18,
      total:
        template.lines.reduce((s, l) => s + l.quantity * plan.price, 0) * 1.18,
      createdAt: new Date().toISOString(),
    };
    store.subscriptions.push(sub);
    return HttpResponse.json(sub, { status: 201 });
  }),

  /* ═══════════════════ CUSTOMERS ═══════════════════ */

  http.get(`${BASE}/customers`, ({ request }) => {
    const params = getParams(request.url);
    const customers = store.users.filter((u) => u.role === "customer");
    const result = store.paginate(
      customers as unknown as Record<string, unknown>[],
      params
    );
    return HttpResponse.json(result);
  }),

  http.post(`${BASE}/customers`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const customer = {
      id: crypto.randomUUID(),
      name: String(body.name),
      email: String(body.email),
      role: "customer" as const,
      password: "Customer@123",
      state: String(body.state),
      company: body.company ? String(body.company) : undefined,
      gstin: body.gstin ? String(body.gstin) : undefined,
      phone: body.phone ? String(body.phone) : undefined,
      createdAt: new Date().toISOString(),
    };
    store.users.push(customer);
    return HttpResponse.json(customer, { status: 201 });
  }),

  /* ═══════════════════ INVOICES ═══════════════════ */

  http.get(`${BASE}/invoices`, ({ request }) => {
    const params = getParams(request.url);
    const result = store.paginate(
      store.invoices as unknown as Record<string, unknown>[],
      params
    );
    return HttpResponse.json(result);
  }),

  http.get(`${BASE}/invoices/:id`, ({ params }) => {
    const inv = store.invoices.find((i) => i.id === params.id);
    if (!inv)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(inv);
  }),

  http.post(`${BASE}/invoices/:id/transition`, async ({ params, request }) => {
    const body = (await request.json()) as { to: string };
    const inv = store.invoices.find((i) => i.id === params.id);
    if (!inv)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    inv.status = body.to as typeof inv.status;
    return HttpResponse.json(inv);
  }),

  http.post(`${BASE}/invoices/:id/send`, ({ params }) => {
    const inv = store.invoices.find((i) => i.id === params.id);
    if (!inv)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json({ message: "Invoice sent" });
  }),

  /* ═══════════════════ BILLING DAY ═══════════════════ */

  http.post(`${BASE}/billing/run`, async () => {
    await delay(200);
    const jobId = crypto.randomUUID();
    const job: BillingJob = {
      id: jobId,
      status: "running",
      created: 0,
      skipped: 0,
      failed: [],
    };
    store.billingJobs.set(jobId, job);

    // Simulate async billing (completes after a few polls)
    setTimeout(() => {
      const activeSubs = store.subscriptions.filter(
        (s) => s.status === "Active"
      );
      let created = 0;
      let skipped = 0;
      const failed: { subscription: string; reason: string }[] = [];

      activeSubs.forEach((sub) => {
        const now = new Date();
        const periodKey = `${sub.id}-${now.getFullYear()}-${now.getMonth()}`;

        // Idempotency: check if already billed for this period
        const alreadyBilled = store.invoices.some(
          (inv) => inv.billingPeriodKey === periodKey
        );

        if (alreadyBilled) {
          skipped++;
          return;
        }

        // Generate invoice
        try {
          const lines = sub.lines.map((sl) => ({
            id: crypto.randomUUID(),
            productName: sl.productName,
            quantity: sl.quantity,
            unitPrice: sl.unitPrice,
            taxRate: sl.taxRate,
            taxAmount: sl.quantity * sl.unitPrice * (sl.taxRate / 100),
            amount: sl.quantity * sl.unitPrice * (1 + sl.taxRate / 100),
          }));

          const subtotal = lines.reduce(
            (s, l) => s + l.quantity * l.unitPrice,
            0
          );
          const taxTotal = lines.reduce((s, l) => s + l.taxAmount, 0);

          store.invoices.push({
            id: crypto.randomUUID(),
            number: `INV-${String(store.invoices.length + 1).padStart(5, "0")}`,
            subscriptionId: sub.id,
            subscriptionNumber: sub.number,
            customerId: sub.customerId,
            customerName: sub.customerName,
            status: "Draft",
            dueDate: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            billingPeriodKey: periodKey,
            lines,
            subtotal,
            discountAmount: 0,
            taxTotal,
            total: subtotal + taxTotal,
            createdAt: now.toISOString(),
          });
          created++;
        } catch {
          failed.push({
            subscription: sub.number,
            reason: "Invoice generation error",
          });
        }
      });

      job.status = "completed";
      job.created = created;
      job.skipped = skipped;
      job.failed = failed;
      job.completedAt = new Date().toISOString();
    }, 2000);

    return HttpResponse.json({ job_id: jobId });
  }),

  http.get(`${BASE}/billing/jobs/:id`, ({ params }) => {
    const job = store.billingJobs.get(params.id as string);
    if (!job)
      return HttpResponse.json({ message: "Job not found" }, { status: 404 });
    return HttpResponse.json(job);
  }),

  /* ═══════════════════ PAYMENTS ═══════════════════ */

  http.get(`${BASE}/payments`, ({ request }) => {
    const params = getParams(request.url);
    const result = store.paginate(
      store.payments as unknown as Record<string, unknown>[],
      params
    );
    return HttpResponse.json(result);
  }),

  http.post(`${BASE}/payments`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const payment = {
      id: crypto.randomUUID(),
      invoiceId: String(body.invoiceId || body.invoice_id),
      method: body.method as "UPI" | "NetBanking" | "Card" | "Cash" | "Bank",
      amount: Number(body.amount),
      date: String(body.date),
      note: String(body.note || ""),
      createdAt: new Date().toISOString(),
    };
    store.payments.push(payment);

    // Mark invoice as paid if payment covers full amount
    const invoice = store.invoices.find((i) => i.id === payment.invoiceId);
    if (invoice) {
      const totalPaid = store.payments
        .filter((p) => p.invoiceId === invoice.id)
        .reduce((sum, p) => sum + p.amount, 0);
      if (totalPaid >= invoice.total) {
        invoice.status = "Paid";
      }
    }

    return HttpResponse.json(payment, { status: 201 });
  }),

  /* ═══════════════════ TAXES ═══════════════════ */

  http.get(`${BASE}/taxes`, () => {
    return HttpResponse.json({
      items: store.taxes,
      total: store.taxes.length,
      page: 1,
      page_size: 50,
    });
  }),

  http.post(`${BASE}/taxes`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const tax = {
      id: crypto.randomUUID(),
      name: String(body.name),
      type: body.type as "CGST" | "SGST" | "IGST",
      rate: Number(body.rate),
      state: String(body.state || ""),
    };
    store.taxes.push(tax);
    return HttpResponse.json(tax, { status: 201 });
  }),

  http.patch(`${BASE}/taxes/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const tax = store.taxes.find((t) => t.id === params.id);
    if (!tax)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    Object.assign(tax, body);
    return HttpResponse.json(tax);
  }),

  /* ═══════════════════ DISCOUNTS ═══════════════════ */

  http.get(`${BASE}/discounts`, ({ request }) => {
    const params = getParams(request.url);
    const result = store.paginate(
      store.discounts as unknown as Record<string, unknown>[],
      params
    );
    return HttpResponse.json(result);
  }),

  http.post(`${BASE}/discounts`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const discount = {
      id: crypto.randomUUID(),
      name: String(body.name),
      type: body.type as "fixed" | "percent",
      value: Number(body.value),
      minPurchase: Number(body.minPurchase || 0),
      minQty: Number(body.minQty || 0),
      startDate: String(body.startDate),
      endDate: body.endDate ? String(body.endDate) : null,
      usageLimit: Number(body.usageLimit || 0),
      usedCount: 0,
      scope: body.scope as "product" | "subscription",
    };
    store.discounts.push(discount);
    return HttpResponse.json(discount, { status: 201 });
  }),

  http.patch(`${BASE}/discounts/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const discount = store.discounts.find((d) => d.id === params.id);
    if (!discount)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    Object.assign(discount, body);
    return HttpResponse.json(discount);
  }),

  /* ═══════════════════ STAFF (admin only) ═══════════════════ */

  http.get(`${BASE}/staff`, ({ request }) => {
    const params = getParams(request.url);
    const staffUsers = store.users.filter(
      (u) => u.role === "staff" || u.role === "admin" || u.role === "finance_lead"
    );
    const result = store.paginate(
      staffUsers as unknown as Record<string, unknown>[],
      params
    );
    return HttpResponse.json(result);
  }),

  http.post(`${BASE}/staff`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const user = {
      id: crypto.randomUUID(),
      name: String(body.name),
      email: String(body.email),
      role: "staff" as const,
      password: String(body.password),
      state: "Maharashtra",
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    return HttpResponse.json(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      { status: 201 }
    );
  }),

  http.delete(`${BASE}/staff/:id`, ({ params }) => {
    const idx = store.users.findIndex(
      (u) => u.id === params.id && u.role === "staff"
    );
    if (idx === -1)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    store.users.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  /* ═══════════════════ REPORTS ═══════════════════ */

  http.get(`${BASE}/reports/summary`, () => {
    const activeSubs = store.subscriptions.filter(
      (s) => s.status === "Active"
    ).length;
    const revenue = store.invoices
      .filter((i) => i.status === "Paid")
      .reduce((sum, i) => sum + i.total, 0);
    const collected = store.payments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = store.invoices
      .filter((i) => i.status !== "Paid")
      .reduce((sum, i) => sum + i.total, 0);
    const overdueCount = store.invoices.filter(
      (i) =>
        i.status !== "Paid" && new Date(i.dueDate) < new Date()
    ).length;

    // Generate a 12-month time series
    const timeSeries = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 11 + i);
      const monthStr = date.toISOString().slice(0, 7);
      return {
        date: monthStr,
        revenue: Math.round(revenue / 12 + Math.random() * 50000),
        outstanding: Math.round(outstanding / 12 + Math.random() * 20000),
      };
    });

    return HttpResponse.json({
      activeSubscriptions: activeSubs,
      revenue,
      collected,
      outstanding,
      overdueCount,
      timeSeries,
    });
  }),

  http.get(`${BASE}/reports/overdue`, ({ request }) => {
    const params = getParams(request.url);
    const overdue = store.invoices
      .filter(
        (i) =>
          i.status !== "Paid" && new Date(i.dueDate) < new Date()
      )
      .map((i) => ({
        ...i,
        daysOverdue: Math.floor(
          (Date.now() - new Date(i.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        ),
      }));
    const result = store.paginate(
      overdue as unknown as Record<string, unknown>[],
      params
    );
    return HttpResponse.json(result);
  }),
];
