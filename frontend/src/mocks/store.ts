/**
 * MSW in-memory store.
 * Generates 2,000+ subscriptions, 5,000+ invoices, products, plans, customers,
 * payments, taxes, discounts, and staff at runtime using faker.
 * Supports CRUD, filtering, sorting, and server-style pagination.
 */

import { faker } from "@faker-js/faker";

// Seed for reproducible data across reloads
faker.seed(42);

/* ═══════════════════════════════════════════════════════════════
   Types (mirrors the API contract)
   ═══════════════════════════════════════════════════════════════ */

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "customer" | "finance_lead";
  password: string;
  state: string;
  company?: string;
  gstin?: string;
  phone?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  salesPrice: number;
  costPrice: number;
  notes: string;
  createdAt: string;
}

export interface Variant {
  id: string;
  productId: string;
  brand: string;
  priceDelta: number;
}

export interface Plan {
  id: string;
  name: string;
  productId: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
  price: number;
  minQty: number;
  availableFrom: string;
  availableTo: string | null;
  autoClose: boolean;
  closable: boolean;
  pausable: boolean;
  renewable: boolean;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  planId: string;
  validDays: number;
  lines: { productId: string; quantity: number }[];
}

export type SubscriptionStatus =
  | "Draft"
  | "Quotation"
  | "Confirmed"
  | "Active"
  | "Closed";

export interface SubscriptionLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export interface Subscription {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  planId: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  nextInvoiceDate?: string;
  period?: "daily" | "weekly" | "monthly" | "yearly";
  paymentTerms: string;
  status: SubscriptionStatus;
  lines: SubscriptionLine[];
  subtotal: number;
  taxTotal: number;
  total: number;
  createdAt: string;
}

export type InvoiceStatus = "Draft" | "Confirmed" | "Paid";

export interface InvoiceLine {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  subscriptionId: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  status: InvoiceStatus;
  dueDate: string;
  billingPeriodKey: string;
  lines: InvoiceLine[];
  subtotal: number;
  discountAmount: number;
  taxTotal: number;
  total: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  method: "UPI" | "NetBanking" | "Card" | "Cash" | "Bank";
  amount: number;
  date: string;
  note: string;
  createdAt: string;
}

export interface Tax {
  id: string;
  name: string;
  type: "CGST" | "SGST" | "IGST";
  rate: number;
  state: string;
}

export interface Discount {
  id: string;
  name: string;
  type: "fixed" | "percent";
  value: number;
  minPurchase: number;
  minQty: number;
  startDate: string;
  endDate: string | null;
  usageLimit: number;
  usedCount: number;
  scope: "product" | "subscription";
}

export interface BillingJob {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  created: number;
  skipped: number;
  failed: { subscription: string; reason: string }[];
  completedAt?: string;
}

export interface ReportSummary {
  activeSubscriptions: number;
  revenue: number;
  collected: number;
  outstanding: number;
  overdueCount: number;
  timeSeries: { date: string; revenue: number; outstanding: number }[];
}

/* ═══════════════════════════════════════════════════════════════
   Data generation
   ═══════════════════════════════════════════════════════════════ */

const INDIAN_STATES = [
  "Maharashtra", "Karnataka", "Tamil Nadu", "Delhi", "Gujarat",
  "Rajasthan", "Uttar Pradesh", "West Bengal", "Kerala", "Telangana",
  "Madhya Pradesh", "Bihar", "Andhra Pradesh", "Punjab", "Haryana",
];

const PRODUCT_NAMES = [
  "Odoo ERP", "Brightloop CRM", "CloudDesk Suite", "DataSync Pro",
  "InvoiceFlow", "InventoryHub", "PayrollMaster", "HRConnect",
  "ProjectTracker", "EmailCampaigner", "ChatBot Premium", "AnalyticsDash",
];

const PLAN_PERIODS: Plan["period"][] = ["daily", "weekly", "monthly", "yearly"];

function generateId(): string {
  return faker.string.uuid();
}

function randomDate(start: Date, end: Date): string {
  return faker.date.between({ from: start, to: end }).toISOString();
}

class MockStore {
  users: User[] = [];
  products: Product[] = [];
  variants: Variant[] = [];
  plans: Plan[] = [];
  quotationTemplates: QuotationTemplate[] = [];
  subscriptions: Subscription[] = [];
  invoices: Invoice[] = [];
  payments: Payment[] = [];
  taxes: Tax[] = [];
  discounts: Discount[] = [];
  billingJobs: Map<string, BillingJob> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Users
    // Admin
    this.users.push({
      id: generateId(),
      name: "Admin User",
      email: "admin@brightloop.in",
      role: "admin",
      password: "Admin@123",
      state: "Maharashtra",
      createdAt: new Date().toISOString(),
    });

    // Finance lead
    this.users.push({
      id: generateId(),
      name: "Finance Lead",
      email: "finance@brightloop.in",
      role: "finance_lead",
      password: "Finance@123",
      state: "Maharashtra",
      createdAt: new Date().toISOString(),
    });

    // Staff (5)
    for (let i = 0; i < 5; i++) {
      this.users.push({
        id: generateId(),
        name: faker.person.fullName(),
        email: `staff${i + 1}@brightloop.in`,
        role: "staff",
        password: "Staff@123",
        state: faker.helpers.arrayElement(INDIAN_STATES),
        createdAt: randomDate(new Date("2024-01-01"), new Date()),
      });
    }

    // Customers (500)
    for (let i = 0; i < 500; i++) {
      this.users.push({
        id: generateId(),
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        role: "customer",
        password: "Customer@123",
        state: faker.helpers.arrayElement(INDIAN_STATES),
        company: faker.company.name(),
        gstin: `${faker.number.int({ min: 10, max: 37 })}${"ABCDE1234F1Z"}${faker.string.alphanumeric(1).toUpperCase()}`,
        phone: `+91${faker.string.numeric(10)}`,
        createdAt: randomDate(new Date("2024-01-01"), new Date()),
      });
    }

    // 2. Products (12)
    PRODUCT_NAMES.forEach((name) => {
      const id = generateId();
      this.products.push({
        id,
        name,
        type: faker.helpers.arrayElement(["Software", "Service", "Add-on"]),
        salesPrice: faker.number.int({ min: 500, max: 50000 }),
        costPrice: faker.number.int({ min: 200, max: 30000 }),
        notes: faker.lorem.sentence(),
        createdAt: randomDate(new Date("2024-01-01"), new Date("2024-06-01")),
      });

      // Variants per product (2-4)
      const variantCount = faker.number.int({ min: 2, max: 4 });
      const brands = ["Odoo", "SAP", "Zoho", "Freshworks", "Salesforce"];
      for (let v = 0; v < variantCount; v++) {
        this.variants.push({
          id: generateId(),
          productId: id,
          brand: brands[v % brands.length],
          priceDelta: faker.number.int({ min: -500, max: 2000 }),
        });
      }
    });

    // 3. Plans (24, 2 per product)
    this.products.forEach((product) => {
      for (let p = 0; p < 2; p++) {
        this.plans.push({
          id: generateId(),
          name: `${product.name} ${p === 0 ? "Basic" : "Pro"}`,
          productId: product.id,
          period: faker.helpers.arrayElement(PLAN_PERIODS),
          price: product.salesPrice * (p === 0 ? 1 : 1.5),
          minQty: faker.number.int({ min: 1, max: 5 }),
          availableFrom: "2024-01-01",
          availableTo: null,
          autoClose: faker.datatype.boolean(),
          closable: true,
          pausable: faker.datatype.boolean(),
          renewable: true,
        });
      }
    });

    // 4. Quotation templates (6)
    for (let i = 0; i < 6; i++) {
      const plan = faker.helpers.arrayElement(this.plans);
      this.quotationTemplates.push({
        id: generateId(),
        name: `Template ${i + 1}`,
        planId: plan.id,
        validDays: faker.helpers.arrayElement([7, 14, 30]),
        lines: [
          {
            productId: plan.productId,
            quantity: faker.number.int({ min: 1, max: 10 }),
          },
        ],
      });
    }

    // 5. Taxes (GST rules)
    this.taxes = [
      { id: generateId(), name: "CGST 9%", type: "CGST", rate: 9, state: "" },
      { id: generateId(), name: "SGST 9%", type: "SGST", rate: 9, state: "" },
      { id: generateId(), name: "IGST 18%", type: "IGST", rate: 18, state: "" },
    ];

    // 6. Discounts (8)
    for (let i = 0; i < 8; i++) {
      const isPercent = faker.datatype.boolean();
      this.discounts.push({
        id: generateId(),
        name: faker.helpers.arrayElement([
          "Launch Offer", "Bulk Discount", "Early Bird", "Festive Sale",
          "Loyalty Reward", "First Order", "Referral", "Annual Special",
        ]),
        type: isPercent ? "percent" : "fixed",
        value: isPercent
          ? faker.number.int({ min: 5, max: 25 })
          : faker.number.int({ min: 100, max: 5000 }),
        minPurchase: faker.number.int({ min: 0, max: 10000 }),
        minQty: faker.number.int({ min: 0, max: 3 }),
        startDate: "2024-01-01",
        endDate: faker.helpers.arrayElement([null, "2025-12-31"]),
        usageLimit: faker.number.int({ min: 10, max: 500 }),
        usedCount: faker.number.int({ min: 0, max: 100 }),
        scope: faker.helpers.arrayElement(["product", "subscription"]),
      });
    }

    // 7. Subscriptions (2,200+)
    const customers = this.users.filter((u) => u.role === "customer");
    const statuses: SubscriptionStatus[] = [
      "Draft", "Quotation", "Confirmed", "Active", "Active", "Active", "Closed",
    ];

    for (let i = 0; i < 2200; i++) {
      const customer = faker.helpers.arrayElement(customers);
      const plan = faker.helpers.arrayElement(this.plans);
      const product = this.products.find((p) => p.id === plan.productId)!;
      const status = faker.helpers.arrayElement(statuses);
      const startDate = randomDate(new Date("2024-01-01"), new Date());
      const qty = faker.number.int({ min: plan.minQty, max: plan.minQty + 10 });
      const unitPrice = plan.price;
      const taxRate = 18;
      const lineAmount = qty * unitPrice;
      const taxAmount = lineAmount * (taxRate / 100);

      const sub: Subscription = {
        id: generateId(),
        number: `SUB-${String(i + 1).padStart(4, "0")}`,
        customerId: customer.id,
        customerName: customer.name,
        planId: plan.id,
        planName: plan.name,
        startDate,
        expiryDate: new Date(
          new Date(startDate).getTime() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
        nextInvoiceDate: new Date(
          new Date(startDate).getTime() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        period: plan.period,
        paymentTerms: faker.helpers.arrayElement(["Net 15", "Net 30", "Net 45"]),
        status,
        lines: [
          {
            id: generateId(),
            productId: product.id,
            productName: product.name,
            quantity: qty,
            unitPrice,
            taxRate,
            amount: lineAmount + taxAmount,
          },
        ],
        subtotal: lineAmount,
        taxTotal: taxAmount,
        total: lineAmount + taxAmount,
        createdAt: startDate,
      };
      this.subscriptions.push(sub);
    }

    // 8. Invoices (5,500+, some subscriptions get multiple invoices)
    let invoiceCounter = 0;
    const invoiceStatuses: InvoiceStatus[] = [
      "Draft", "Confirmed", "Confirmed", "Paid", "Paid", "Paid",
    ];

    this.subscriptions
      .filter((s) => s.status === "Active" || s.status === "Confirmed")
      .forEach((sub) => {
        const invoiceCount = faker.number.int({ min: 1, max: 4 });
        for (let j = 0; j < invoiceCount; j++) {
          invoiceCounter++;
          const status = faker.helpers.arrayElement(invoiceStatuses);
          const createdDate = randomDate(
            new Date(sub.startDate),
            new Date()
          );
          const dueDate = new Date(
            new Date(createdDate).getTime() + 30 * 24 * 60 * 60 * 1000
          ).toISOString();
          const billingMonth = new Date(createdDate);
          const periodKey = `${sub.id}-${billingMonth.getFullYear()}-${billingMonth.getMonth()}`;

          const lines: InvoiceLine[] = sub.lines.map((sl) => ({
            id: generateId(),
            productName: sl.productName,
            quantity: sl.quantity,
            unitPrice: sl.unitPrice,
            taxRate: sl.taxRate,
            taxAmount: sl.quantity * sl.unitPrice * (sl.taxRate / 100),
            amount: sl.quantity * sl.unitPrice * (1 + sl.taxRate / 100),
          }));

          const subtotal = lines.reduce(
            (sum, l) => sum + l.quantity * l.unitPrice,
            0
          );
          const taxTotal = lines.reduce((sum, l) => sum + l.taxAmount, 0);
          const discountAmount = faker.helpers.arrayElement([0, 0, 0, 500, 1000]);

          this.invoices.push({
            id: generateId(),
            number: `INV-${String(invoiceCounter).padStart(5, "0")}`,
            subscriptionId: sub.id,
            subscriptionNumber: sub.number,
            customerId: sub.customerId,
            customerName: sub.customerName,
            status,
            dueDate,
            billingPeriodKey: periodKey,
            lines,
            subtotal,
            discountAmount,
            taxTotal,
            total: subtotal + taxTotal - discountAmount,
            createdAt: createdDate,
          });
        }
      });

    // 9. Payments (for paid invoices)
    this.invoices
      .filter((inv) => inv.status === "Paid")
      .forEach((inv) => {
        this.payments.push({
          id: generateId(),
          invoiceId: inv.id,
          method: faker.helpers.arrayElement([
            "UPI", "NetBanking", "Card", "Cash", "Bank",
          ]),
          amount: inv.total,
          date: randomDate(new Date(inv.createdAt), new Date()),
          note: faker.helpers.arrayElement(["", "Auto-debit", "Manual payment", ""]),
          createdAt: new Date().toISOString(),
        });
      });

    console.log(
      `[MSW Store] Seeded: ${this.users.length} users, ${this.products.length} products, ` +
      `${this.plans.length} plans, ${this.subscriptions.length} subscriptions, ` +
      `${this.invoices.length} invoices, ${this.payments.length} payments`
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     Generic list helper with pagination, sorting, filtering
     ═══════════════════════════════════════════════════════════════ */

  paginate<T extends Record<string, unknown>>(
    items: T[],
    params: {
      page?: number;
      page_size?: number;
      sort?: string;
      order?: string;
      q?: string;
      filters?: Record<string, string | undefined>;
    }
  ): { items: T[]; total: number; page: number; page_size: number } {
    let filtered = [...items];

    // Text search across all string fields
    if (params.q) {
      const q = params.q.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some(
          (val) => typeof val === "string" && val.toLowerCase().includes(q)
        )
      );
    }

    // Apply specific filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, val]) => {
        if (val !== undefined && val !== "" && val !== "all") {
          filtered = filtered.filter(
            (item) =>
              String(item[key]).toLowerCase() === val.toLowerCase()
          );
        }
      });
    }

    // Sort
    if (params.sort) {
      const sortKey = params.sort as keyof T;
      const dir = params.order === "desc" ? -1 : 1;
      filtered.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return aVal.localeCompare(bVal) * dir;
        }
        return ((aVal as number) - (bVal as number)) * dir;
      });
    }

    const total = filtered.length;
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.page_size || 20));
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return { items: paged, total, page, page_size: pageSize };
  }
}

// Singleton store
export const store = new MockStore();
