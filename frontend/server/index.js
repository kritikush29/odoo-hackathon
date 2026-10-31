import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Password policy validator: minimum 8 chars, 1 uppercase, 1 special symbol
export const validatePasswordPolicy = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special symbol (!@#$%^&*...).' };
  }
  return { valid: true };
};

// ==================== AUTH & USERS ====================

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, company, role = 'CUSTOMER', requesterRole = 'CUSTOMER' } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }

  // Check unique email
  const existing = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  // Password policy check
  const pwCheck = validatePasswordPolicy(password);
  if (!pwCheck.valid) {
    return res.status(400).json({ error: pwCheck.message });
  }

  // Rule: Only admin can add staff or another admin
  let assignedRole = 'CUSTOMER';
  if (role === 'STAFF' || role === 'ADMIN') {
    if (requesterRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only the admin can add a new member of staff or admin.' });
    }
    assignedRole = role;
  }

  const newUser = {
    id: `USR-${Date.now().toString().slice(-4)}`,
    name,
    email,
    role: assignedRole,
    password, // Plain for hackathon demo simplicity
    company: company || (assignedRole === 'CUSTOMER' ? `${name}'s Company` : 'Brightloop'),
    createdAt: new Date().toISOString()
  };

  db.data.users.push(newUser);
  db.save();

  return res.status(201).json({
    message: 'User registered successfully',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, company: newUser.company }
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.data.users.find(u => u.email.toLowerCase() === email?.toLowerCase());

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password credentials.' });
  }

  return res.json({
    message: 'Logged in successfully',
    user: { id: user.id, name: user.name, email: user.email, role: user.role, company: user.company }
  });
});

// Forgot Password (Simulated Email Dispatch)
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.data.users.find(u => u.email.toLowerCase() === email?.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email address.' });
  }

  const resetToken = `reset_${Math.random().toString(36).substring(2, 10)}`;
  const resetLink = `https://app.brightloop.com/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  return res.json({
    message: `A secure password reset link has been dispatched to ${email}`,
    resetLink,
    debugNote: 'Simulated email delivery completed.'
  });
});

// List users (Admin or Staff)
app.get('/api/users', (req, res) => {
  const role = req.query.role;
  let list = db.data.users.map(({ password, ...u }) => u);
  if (role) {
    list = list.filter(u => u.role === role);
  }
  return res.json(list);
});

// ==================== PRODUCTS & VARIANTS ====================

app.get('/api/products', (req, res) => {
  return res.json(db.data.products);
});

app.post('/api/products', (req, res) => {
  const { name, type, salesPrice, costPrice, notes, variants = [] } = req.body;
  if (!name || salesPrice === undefined) {
    return res.status(400).json({ error: 'Name and sales price are required.' });
  }

  const newProd = {
    id: `PROD-${String(db.data.products.length + 1).padStart(3, '0')}`,
    name,
    type: type || 'Software License',
    salesPrice: Number(salesPrice),
    costPrice: Number(costPrice || 0),
    notes: notes || '',
    variants: variants.map((v, i) => ({
      id: v.id || `var-${Date.now()}-${i}`,
      name: v.name,
      priceAdjustment: Number(v.priceAdjustment || 0)
    }))
  };

  db.data.products.push(newProd);
  db.save();
  return res.status(201).json(newProd);
});

app.put('/api/products/:id', (req, res) => {
  const prod = db.data.products.find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ error: 'Product not found.' });

  const { name, type, salesPrice, costPrice, notes, variants } = req.body;
  if (name !== undefined) prod.name = name;
  if (type !== undefined) prod.type = type;
  if (salesPrice !== undefined) prod.salesPrice = Number(salesPrice);
  if (costPrice !== undefined) prod.costPrice = Number(costPrice);
  if (notes !== undefined) prod.notes = notes;
  if (variants !== undefined) prod.variants = variants;

  db.save();
  return res.json(prod);
});

// ==================== PLANS ====================

app.get('/api/plans', (req, res) => {
  return res.json(db.data.plans);
});

app.post('/api/plans', (req, res) => {
  const {
    name, code, cost, frequency = 'monthly', minQuantity = 1,
    startDate, endDate, autoCloseOnEnd = false, allowPause = true,
    allowRenewal = true, allowEarlyClose = true, description = ''
  } = req.body;

  if (!name || cost === undefined) {
    return res.status(400).json({ error: 'Name and cost are required.' });
  }

  const newPlan = {
    id: `PLAN-${String(db.data.plans.length + 1).padStart(3, '0')}`,
    name,
    code: code || name.replace(/\s+/g, '-').toUpperCase(),
    cost: Number(cost),
    frequency, // daily, weekly, monthly, yearly
    minQuantity: Number(minQuantity) || 1,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || '2028-12-31',
    autoCloseOnEnd: Boolean(autoCloseOnEnd),
    allowPause: Boolean(allowPause),
    allowRenewal: Boolean(allowRenewal),
    allowEarlyClose: Boolean(allowEarlyClose),
    description
  };

  db.data.plans.push(newPlan);
  db.save();
  return res.status(201).json(newPlan);
});

app.put('/api/plans/:id', (req, res) => {
  const plan = db.data.plans.find(p => p.id === req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found.' });

  Object.assign(plan, req.body);
  db.save();
  return res.json(plan);
});

// ==================== TAX RULES ====================

app.get('/api/taxes', (req, res) => {
  return res.json(db.data.taxes);
});

app.post('/api/taxes', (req, res) => {
  const { name, rate, isDefault, description } = req.body;
  const newTax = {
    id: `TAX-${String(db.data.taxes.length + 1).padStart(3, '0')}`,
    name,
    rate: Number(rate) || 0,
    isDefault: Boolean(isDefault),
    description: description || ''
  };

  if (newTax.isDefault) {
    db.data.taxes.forEach(t => t.isDefault = false);
  }

  db.data.taxes.push(newTax);
  db.save();
  return res.status(201).json(newTax);
});

// ==================== DISCOUNT RULES ====================

app.get('/api/discounts', (req, res) => {
  return res.json(db.data.discounts);
});

app.post('/api/discounts', (req, res) => {
  const {
    code, name, type = 'percentage', value, minQuantity = 0,
    minPurchaseAmount = 0, startDate, endDate, maxUsageCount = 100,
    scope = 'whole_subscription', applicableProductIds = []
  } = req.body;

  if (!code || !value) {
    return res.status(400).json({ error: 'Discount code and value are required.' });
  }

  const existing = db.data.discounts.find(d => d.code.toUpperCase() === code.toUpperCase());
  if (existing) {
    return res.status(400).json({ error: 'Discount code already exists.' });
  }

  const newDisc = {
    id: `DISC-${String(db.data.discounts.length + 1).padStart(3, '0')}`,
    code: code.toUpperCase().trim(),
    name: name || code,
    type, // 'percentage' | 'fixed'
    value: Number(value),
    minQuantity: Number(minQuantity) || 0,
    minPurchaseAmount: Number(minPurchaseAmount) || 0,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || '2028-12-31',
    maxUsageCount: Number(maxUsageCount) || 100,
    currentUsageCount: 0,
    scope, // 'whole_subscription' | 'specific_products'
    applicableProductIds: Array.isArray(applicableProductIds) ? applicableProductIds : [],
    isActive: true
  };

  db.data.discounts.push(newDisc);
  db.save();
  return res.status(201).json(newDisc);
});

// ==================== QUOTATION TEMPLATES ====================

app.get('/api/quotation-templates', (req, res) => {
  return res.json(db.data.quotationTemplates);
});

app.post('/api/quotation-templates', (req, res) => {
  const { name, planId, validityDays = 30, paymentTerms = 'Net 30', taxId, discountCode, lines = [] } = req.body;
  if (!name || !planId) {
    return res.status(400).json({ error: 'Template name and planId are required.' });
  }

  const newTemplate = {
    id: `QT-${String(db.data.quotationTemplates.length + 1).padStart(3, '0')}`,
    name,
    planId,
    validityDays: Number(validityDays) || 30,
    paymentTerms,
    taxId: taxId || db.data.taxes[0]?.id,
    discountCode: discountCode || '',
    lines
  };

  db.data.quotationTemplates.push(newTemplate);
  db.save();
  return res.status(201).json(newTemplate);
});

// ==================== SUBSCRIPTIONS ====================

app.get('/api/subscriptions', (req, res) => {
  const { customerId, status } = req.query;
  let list = db.data.subscriptions;
  if (customerId) {
    list = list.filter(s => s.customerId === customerId);
  }
  if (status) {
    list = list.filter(s => s.status.toLowerCase() === status.toLowerCase());
  }
  return res.json(list);
});

app.post('/api/subscriptions', (req, res) => {
  const {
    customerId, customerName, customerEmail, planId,
    startDate, expiryDate, paymentTerms = 'Net 30', taxId,
    discountCode, lines = [], templateId
  } = req.body;

  const plan = db.data.plans.find(p => p.id === planId);
  const nextNum = `SUB-2026-${String(db.data.subscriptions.length + 1).padStart(3, '0')}`;

  const start = startDate || new Date().toISOString().split('T')[0];
  let calculatedExpiry = expiryDate;
  if (!calculatedExpiry) {
    const d = new Date(start);
    if (plan?.frequency === 'yearly') d.setFullYear(d.getFullYear() + 1);
    else if (plan?.frequency === 'weekly') d.setDate(d.getDate() + 7);
    else if (plan?.frequency === 'daily') d.setDate(d.getDate() + 1);
    else d.setMonth(d.getMonth() + 1);
    calculatedExpiry = d.toISOString().split('T')[0];
  }

  const sub = {
    id: nextNum,
    subscriptionNumber: nextNum,
    customerId: customerId || 'USR-003',
    customerName: customerName || 'Acme Corp',
    customerEmail: customerEmail || 'customer@example.com',
    planId: planId || db.data.plans[0].id,
    planName: plan?.name || 'Growth Monthly',
    billingFrequency: plan?.frequency || 'monthly',
    status: 'Draft', // Draft -> Quotation -> Confirmed -> Active -> Closed
    startDate: start,
    expiryDate: calculatedExpiry,
    nextBillingDate: start,
    lastBilledDate: null,
    paymentTerms: paymentTerms || 'Net 30',
    taxId: taxId || db.data.taxes[0]?.id,
    discountCode: discountCode || '',
    lines: lines.map((l, idx) => ({
      id: `line-${Date.now()}-${idx}`,
      productId: l.productId,
      productName: l.productName || 'Product',
      variantId: l.variantId || '',
      variantName: l.variantName || 'Standard',
      quantity: Number(l.quantity) || 1,
      unitPrice: Number(l.unitPrice) || 0,
      total: (Number(l.quantity) || 1) * (Number(l.unitPrice) || 0)
    }))
  };

  db.data.subscriptions.push(sub);
  db.save();
  return res.status(201).json(sub);
});

// Update Subscription Status (Lifecycle: Draft -> Quotation -> Confirmed -> Active -> Closed)
app.put('/api/subscriptions/:id/status', (req, res) => {
  const { status, note } = req.body;
  const sub = db.data.subscriptions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Subscription not found.' });

  const plan = db.data.plans.find(p => p.id === sub.planId);

  // Policy Checks
  if (status === 'Paused' && plan && !plan.allowPause) {
    return res.status(400).json({ error: `Plan '${plan.name}' does not allow pausing.` });
  }

  if (status === 'Closed' && plan && !plan.allowEarlyClose) {
    // If not past expiry date, block
    const today = new Date().toISOString().split('T')[0];
    if (sub.expiryDate > today && sub.status === 'Active') {
      return res.status(400).json({ error: `Plan '${plan.name}' does not permit early closure before contract expiry date.` });
    }
  }

  sub.status = status;

  // If confirmed or activated, check if discount usage should increment
  if (status === 'Confirmed' && sub.discountCode) {
    const disc = db.data.discounts.find(d => d.code.toUpperCase() === sub.discountCode.toUpperCase());
    if (disc) {
      disc.currentUsageCount = (disc.currentUsageCount || 0) + 1;
      if (disc.currentUsageCount >= disc.maxUsageCount) {
        disc.isActive = false;
      }
    }
  }

  db.save();
  return res.json(sub);
});

// Renewal Action
app.post('/api/subscriptions/:id/renew', (req, res) => {
  const sub = db.data.subscriptions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Subscription not found.' });

  const plan = db.data.plans.find(p => p.id === sub.planId);
  if (plan && !plan.allowRenewal) {
    return res.status(400).json({ error: `Plan '${plan.name}' does not support renewal.` });
  }

  const currentExpiry = new Date(sub.expiryDate);
  if (sub.billingFrequency === 'yearly') currentExpiry.setFullYear(currentExpiry.getFullYear() + 1);
  else if (sub.billingFrequency === 'weekly') currentExpiry.setDate(currentExpiry.getDate() + 7);
  else if (sub.billingFrequency === 'daily') currentExpiry.setDate(currentExpiry.getDate() + 1);
  else currentExpiry.setMonth(currentExpiry.getMonth() + 1);

  sub.expiryDate = currentExpiry.toISOString().split('T')[0];
  sub.status = 'Active';
  db.save();

  return res.json({ message: 'Subscription successfully renewed', subscription: sub });
});

// Add-on product toggle on existing subscription
app.post('/api/subscriptions/:id/toggle-addon', (req, res) => {
  const { productId, variantId, enable } = req.body;
  const sub = db.data.subscriptions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Subscription not found.' });

  const product = db.data.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  const existingIndex = sub.lines.findIndex(l => l.productId === productId);

  if (enable) {
    if (existingIndex >= 0) {
      return res.json({ message: 'Add-on is already active on this subscription.', subscription: sub });
    }
    const variant = product.variants?.find(v => v.id === variantId) || product.variants?.[0];
    const unitPrice = product.salesPrice + (variant?.priceAdjustment || 0);
    sub.lines.push({
      id: `line-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      variantId: variant?.id || '',
      variantName: variant?.name || 'Standard',
      quantity: 1,
      unitPrice,
      total: unitPrice
    });
  } else {
    if (existingIndex < 0) {
      return res.json({ message: 'Add-on is not attached to this subscription.', subscription: sub });
    }
    sub.lines.splice(existingIndex, 1);
  }

  db.save();
  return res.json({ message: `Add-on ${enable ? 'activated' : 'removed'} successfully.`, subscription: sub });
});

// ==================== BILLING ENGINE & INVOICES ====================

// Calculate price, discount, and taxes for a subscription
export const computeSubscriptionFinancials = (sub) => {
  let subtotal = 0;
  const lines = sub.lines || [];

  lines.forEach(l => {
    subtotal += (Number(l.quantity) || 1) * (Number(l.unitPrice) || 0);
  });

  // Calculate discount
  let discountAmount = 0;
  if (sub.discountCode) {
    const disc = db.data.discounts.find(
      d => d.code.toUpperCase() === sub.discountCode.toUpperCase() && d.isActive
    );
    if (disc) {
      const today = new Date().toISOString().split('T')[0];
      const notExpired = (!disc.startDate || disc.startDate <= today) && (!disc.endDate || disc.endDate >= today);
      const withinUsage = disc.currentUsageCount < disc.maxUsageCount;

      if (notExpired && withinUsage) {
        if (disc.scope === 'whole_subscription') {
          if (subtotal >= disc.minPurchaseAmount) {
            if (disc.type === 'percentage') {
              discountAmount = (subtotal * disc.value) / 100;
            } else {
              discountAmount = Math.min(disc.value, subtotal);
            }
          }
        } else if (disc.scope === 'specific_products') {
          // Specific products only
          let eligibleSubtotal = 0;
          lines.forEach(l => {
            if (disc.applicableProductIds.includes(l.productId)) {
              eligibleSubtotal += (Number(l.quantity) || 1) * (Number(l.unitPrice) || 0);
            }
          });
          if (eligibleSubtotal > 0) {
            if (disc.type === 'percentage') {
              discountAmount = (eligibleSubtotal * disc.value) / 100;
            } else {
              discountAmount = Math.min(disc.value, eligibleSubtotal);
            }
          }
        }
      }
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // Calculate tax
  const taxRule = db.data.taxes.find(t => t.id === sub.taxId) || db.data.taxes[0];
  const taxRate = taxRule ? taxRule.rate : 0;
  const taxAmount = (discountedSubtotal * taxRate) / 100;
  const totalAmount = Number((discountedSubtotal + taxAmount).toFixed(2));

  return {
    subtotal,
    discountAmount: Number(discountAmount.toFixed(2)),
    taxRate,
    taxAmount: Number(taxAmount.toFixed(2)),
    totalAmount
  };
};

// "Billing Day" - Single Click Automated Recurring Invoice Generation
app.post('/api/billing/run', (req, res) => {
  const { targetDate = new Date().toISOString().split('T')[0], forceAllActive = false } = req.body;
  const activeSubs = db.data.subscriptions.filter(s => s.status === 'Active');

  const generatedInvoices = [];
  const skippedSubs = [];

  activeSubs.forEach(sub => {
    // Check if subscription has already been billed for this billing cycle
    const isDue = forceAllActive || !sub.lastBilledDate || sub.nextBillingDate <= targetDate;

    if (!isDue) {
      skippedSubs.push({
        id: sub.id,
        reason: `Already billed up to date. Next billing due: ${sub.nextBillingDate}`
      });
      return;
    }

    // Check duplicate guard: Ensure no invoice with same subscription and issueDate exists
    const duplicate = db.data.invoices.find(
      inv => inv.subscriptionId === sub.id && inv.issueDate === targetDate
    );
    if (duplicate) {
      skippedSubs.push({
        id: sub.id,
        reason: `Duplicate prevention: Invoice ${duplicate.invoiceNumber} already created for this cycle.`
      });
      return;
    }

    const fin = computeSubscriptionFinancials(sub);
    const invNum = `INV-2026-${String(db.data.invoices.length + 1).padStart(3, '0')}`;

    // Calculate due date based on payment terms
    const dueDateObj = new Date(targetDate);
    if (sub.paymentTerms === 'Net 15') dueDateObj.setDate(dueDateObj.getDate() + 15);
    else if (sub.paymentTerms === 'Net 30') dueDateObj.setDate(dueDateObj.getDate() + 30);
    else if (sub.paymentTerms === 'Net 60') dueDateObj.setDate(dueDateObj.getDate() + 60);
    else dueDateObj.setDate(dueDateObj.getDate() + 1); // Due on Receipt

    // Calculate next billing date
    const nextDateObj = new Date(targetDate);
    if (sub.billingFrequency === 'yearly') nextDateObj.setFullYear(nextDateObj.getFullYear() + 1);
    else if (sub.billingFrequency === 'weekly') nextDateObj.setDate(nextDateObj.getDate() + 7);
    else if (sub.billingFrequency === 'daily') nextDateObj.setDate(nextDateObj.getDate() + 1);
    else nextDateObj.setMonth(nextDateObj.getMonth() + 1); // Monthly

    const invoice = {
      id: invNum,
      invoiceNumber: invNum,
      subscriptionId: sub.id,
      subscriptionNumber: sub.subscriptionNumber,
      customerId: sub.customerId,
      customerName: sub.customerName,
      customerEmail: sub.customerEmail,
      issueDate: targetDate,
      dueDate: dueDateObj.toISOString().split('T')[0],
      paymentTerms: sub.paymentTerms,
      status: 'Confirmed', // Automatically created as Confirmed or Draft
      subtotal: fin.subtotal,
      discountAmount: fin.discountAmount,
      taxRate: fin.taxRate,
      taxAmount: fin.taxAmount,
      totalAmount: fin.totalAmount,
      amountPaid: 0,
      balanceDue: fin.totalAmount,
      billingPeriod: `${targetDate} to ${nextDateObj.toISOString().split('T')[0]}`,
      sentAt: new Date().toISOString(),
      lines: sub.lines.map(l => ({
        productName: `${l.productName} (${l.variantName})`,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        amount: l.total
      }))
    };

    db.data.invoices.push(invoice);
    generatedInvoices.push(invoice);

    // Update subscription last billed and next billing dates
    sub.lastBilledDate = targetDate;
    sub.nextBillingDate = nextDateObj.toISOString().split('T')[0];

    // Check if plan has autoCloseOnEnd and if sub reached expiry
    const plan = db.data.plans.find(p => p.id === sub.planId);
    if (plan?.autoCloseOnEnd && sub.expiryDate <= targetDate) {
      sub.status = 'Closed';
    }
  });

  db.save();

  return res.json({
    message: `Billing run executed for date ${targetDate}`,
    generatedCount: generatedInvoices.length,
    generatedInvoices,
    skippedCount: skippedSubs.length,
    skippedSubs
  });
});

// Invoices CRUD & actions
app.get('/api/invoices', (req, res) => {
  const { customerId, status } = req.query;
  const today = new Date().toISOString().split('T')[0];

  let list = db.data.invoices.map(inv => {
    // Auto flag overdue if past dueDate and balance > 0
    if (inv.status === 'Confirmed' && inv.dueDate < today && inv.balanceDue > 0) {
      return { ...inv, status: 'Overdue' };
    }
    return inv;
  });

  if (customerId) {
    list = list.filter(inv => inv.customerId === customerId);
  }
  if (status) {
    list = list.filter(inv => inv.status.toLowerCase() === status.toLowerCase());
  }

  return res.json(list);
});

app.put('/api/invoices/:id/confirm', (req, res) => {
  const inv = db.data.invoices.find(i => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found.' });
  inv.status = 'Confirmed';
  db.save();
  return res.json(inv);
});

app.put('/api/invoices/:id/cancel', (req, res) => {
  const inv = db.data.invoices.find(i => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found.' });
  inv.status = 'Cancelled';
  db.save();
  return res.json(inv);
});

app.post('/api/invoices/:id/send', (req, res) => {
  const inv = db.data.invoices.find(i => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found.' });
  inv.sentAt = new Date().toISOString();
  db.save();
  return res.json({ message: `Invoice ${inv.invoiceNumber} sent to ${inv.customerEmail}`, invoice: inv });
});

app.post('/api/invoices/:id/chase', (req, res) => {
  const inv = db.data.invoices.find(i => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found.' });
  inv.lastChasedAt = new Date().toISOString();
  db.save();
  return res.json({
    message: `Payment reminder and overdue alert successfully dispatched to ${inv.customerEmail}.`,
    invoice: inv
  });
});

// Customer Self-Service: Generate Invoice from active subscription
app.post('/api/invoices/generate-customer-invoice', (req, res) => {
  const { customerId, subscriptionId } = req.body;
  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required.' });
  }

  // Find subscription
  let sub = db.data.subscriptions.find(s => s.customerId === customerId && (subscriptionId ? s.id === subscriptionId : s.status === 'Active'));
  
  if (!sub) {
    // If no existing subscription, find any subscription for this customer
    sub = db.data.subscriptions.find(s => s.customerId === customerId);
  }

  const user = db.data.users.find(u => u.id === customerId);

  // If customer has no subscription at all yet, auto-provision a starter subscription
  if (!sub) {
    const nextSubNum = `SUB-2026-${String(db.data.subscriptions.length + 1).padStart(3, '0')}`;
    const starterProd = db.data.products[0];
    sub = {
      id: nextSubNum,
      subscriptionNumber: nextSubNum,
      customerId,
      customerName: user ? `${user.name} (${user.company})` : 'Registered Customer',
      customerEmail: user?.email || 'customer@example.com',
      planId: db.data.plans[0].id,
      planName: db.data.plans[0].name,
      billingFrequency: 'monthly',
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: '2027-12-31',
      nextBillingDate: new Date().toISOString().split('T')[0],
      lastBilledDate: null,
      paymentTerms: 'Due on Receipt',
      taxId: db.data.taxes[0]?.id,
      discountCode: '',
      lines: [
        {
          id: `line-${Date.now()}`,
          productId: starterProd.id,
          productName: starterProd.name,
          variantId: starterProd.variants?.[0]?.id || '',
          variantName: starterProd.variants?.[0]?.name || 'Standard',
          quantity: 1,
          unitPrice: starterProd.salesPrice,
          total: starterProd.salesPrice
        }
      ]
    };
    db.data.subscriptions.push(sub);
  }

  const fin = computeSubscriptionFinancials(sub);
  const invNum = `INV-2026-${String(db.data.invoices.length + 1).padStart(3, '0')}`;
  const today = new Date().toISOString().split('T')[0];

  const dueDateObj = new Date();
  if (sub.paymentTerms === 'Net 15') dueDateObj.setDate(dueDateObj.getDate() + 15);
  else if (sub.paymentTerms === 'Net 30') dueDateObj.setDate(dueDateObj.getDate() + 30);
  else dueDateObj.setDate(dueDateObj.getDate() + 1);

  const nextDateObj = new Date();
  nextDateObj.setMonth(nextDateObj.getMonth() + 1);

  const newInvoice = {
    id: invNum,
    invoiceNumber: invNum,
    subscriptionId: sub.id,
    subscriptionNumber: sub.subscriptionNumber,
    customerId: sub.customerId,
    customerName: sub.customerName,
    customerEmail: sub.customerEmail,
    issueDate: today,
    dueDate: dueDateObj.toISOString().split('T')[0],
    paymentTerms: sub.paymentTerms,
    status: 'Confirmed',
    subtotal: fin.subtotal,
    discountAmount: fin.discountAmount,
    taxRate: fin.taxRate,
    taxAmount: fin.taxAmount,
    totalAmount: fin.totalAmount,
    amountPaid: 0,
    balanceDue: fin.totalAmount,
    billingPeriod: `${today} to ${nextDateObj.toISOString().split('T')[0]}`,
    sentAt: new Date().toISOString(),
    lines: (sub.lines || []).map(l => ({
      productName: `${l.productName} (${l.variantName || 'Standard'})`,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      amount: l.total
    }))
  };

  db.data.invoices.push(newInvoice);
  sub.lastBilledDate = today;
  db.save();

  return res.status(201).json({
    message: `Invoice ${newInvoice.invoiceNumber} successfully generated!`,
    invoice: newInvoice
  });
});

// Admin Directory: Every registered customer with invoice count and invoices list
app.get('/api/admin/customers-directory', (req, res) => {
  const customers = db.data.users.filter(u => u.role === 'CUSTOMER');

  const directory = customers.map(cust => {
    const custInvoices = db.data.invoices.filter(i => i.customerId === cust.id);
    const custSubs = db.data.subscriptions.filter(s => s.customerId === cust.id);
    const totalBilled = custInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPaid = custInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const totalBalance = custInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);

    return {
      id: cust.id,
      name: cust.name,
      email: cust.email,
      company: cust.company,
      createdAt: cust.createdAt,
      invoicesGeneratedCount: custInvoices.length,
      totalBilledAmount: Number(totalBilled.toFixed(2)),
      totalPaidAmount: Number(totalPaid.toFixed(2)),
      balanceDue: Number(totalBalance.toFixed(2)),
      activeSubscriptionsCount: custSubs.filter(s => s.status === 'Active').length,
      subscriptions: custSubs,
      invoices: custInvoices
    };
  });

  return res.json(directory);
});

// ==================== PAYMENTS ====================

app.get('/api/payments', (req, res) => {
  const { customerId, invoiceId } = req.query;
  let list = db.data.payments;
  if (customerId) list = list.filter(p => p.customerId === customerId);
  if (invoiceId) list = list.filter(p => p.invoiceId === invoiceId);
  return res.json(list);
});

app.post('/api/payments', (req, res) => {
  const { invoiceId, amount, method = 'Credit Card', note = '', recordedBy = 'Staff' } = req.body;
  const inv = db.data.invoices.find(i => i.id === invoiceId);
  if (!inv) return res.status(404).json({ error: 'Invoice not found.' });

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ error: 'Payment amount must be greater than 0.' });
  }

  const payNum = `PAY-2026-${String(db.data.payments.length + 1).padStart(3, '0')}`;
  const payment = {
    id: payNum,
    paymentNumber: payNum,
    invoiceId: inv.id,
    invoiceNumber: inv.invoiceNumber,
    customerId: inv.customerId,
    customerName: inv.customerName,
    amount: numAmount,
    method,
    paymentDate: new Date().toISOString().split('T')[0],
    note,
    recordedBy,
    createdAt: new Date().toISOString()
  };

  db.data.payments.push(payment);

  // Update invoice balance and status
  inv.amountPaid = Number((inv.amountPaid + numAmount).toFixed(2));
  inv.balanceDue = Number(Math.max(0, inv.totalAmount - inv.amountPaid).toFixed(2));

  if (inv.balanceDue <= 0.01) {
    inv.status = 'Paid';
    inv.balanceDue = 0;
  }

  db.save();

  return res.status(201).json({
    message: 'Payment recorded successfully',
    payment,
    invoiceStatus: inv.status,
    balanceRemaining: inv.balanceDue
  });
});

// ==================== FINANCE LEAD ANALYTICS ====================

app.get('/api/analytics', (req, res) => {
  const startTime = Date.now();
  const today = new Date().toISOString().split('T')[0];

  const activeSubs = db.data.subscriptions.filter(s => s.status === 'Active');
  const allInvoices = db.data.invoices;
  const allPayments = db.data.payments;

  // Monthly Recurring Revenue (MRR) Calculation
  let mrr = 0;
  activeSubs.forEach(sub => {
    const fin = computeSubscriptionFinancials(sub);
    if (sub.billingFrequency === 'monthly') mrr += fin.totalAmount;
    else if (sub.billingFrequency === 'yearly') mrr += (fin.totalAmount / 12);
    else if (sub.billingFrequency === 'weekly') mrr += (fin.totalAmount * 4.33);
    else if (sub.billingFrequency === 'daily') mrr += (fin.totalAmount * 30);
  });
  mrr = Number(mrr.toFixed(2));
  const arr = Number((mrr * 12).toFixed(2));

  // Revenue collected
  const totalRevenueCollected = Number(allPayments.reduce((acc, p) => acc + p.amount, 0).toFixed(2));

  // Total owed / outstanding amount
  const unpaidInvoices = allInvoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled');
  const totalOutstandingOwed = Number(unpaidInvoices.reduce((acc, i) => acc + i.balanceDue, 0).toFixed(2));

  // Overdue Invoices
  const overdueInvoices = unpaidInvoices.filter(i => i.dueDate < today || i.status === 'Overdue');
  const overdueCount = overdueInvoices.length;
  const overdueAmount = Number(overdueInvoices.reduce((acc, i) => acc + i.balanceDue, 0).toFixed(2));

  // Subscription breakdown by status
  const statusCounts = {};
  db.data.subscriptions.forEach(s => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });

  // Top products
  const productUsage = {};
  db.data.subscriptions.forEach(s => {
    (s.lines || []).forEach(l => {
      productUsage[l.productName] = (productUsage[l.productName] || 0) + (l.quantity || 1);
    });
  });

  const responseTimeMs = Date.now() - startTime;

  return res.json({
    kpis: {
      activeSubscriptionsCount: activeSubs.length,
      totalSubscriptionsCount: db.data.subscriptions.length,
      mrr,
      arr,
      totalRevenueCollected,
      totalOutstandingOwed,
      overdueCount,
      overdueAmount
    },
    statusBreakdown: statusCounts,
    productPopularity: productUsage,
    overdueInvoicesList: overdueInvoices,
    recentPayments: allPayments.slice(-5).reverse(),
    meta: {
      responseTimeMs,
      slaTargetMet: responseTimeMs < 2000 // Response under 2 seconds requirement
    }
  });
});

// Seed data reset (Judges convenience)
app.post('/api/seed/reset', (req, res) => {
  const resetData = db.reset();
  return res.json({ message: 'Database reset to fresh demo seed state.', data: resetData });
});

// Start Express Server
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexHtml = path.join(distPath, 'index.html');
    return res.sendFile(indexHtml);
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Brightloop Subscription & Billing Web Platform running on http://localhost:${PORT}`);
});

