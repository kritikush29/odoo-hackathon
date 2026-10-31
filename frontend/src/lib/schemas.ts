import { z } from "zod";

/**
 * BRIGHTLOOP Zod schemas.
 * Shared validation rules for all forms.
 * Used by React Hook Form via @hookform/resolvers.
 */

// Password: more than 8 characters, uppercase, lowercase, special character
const passwordSchema = z
  .string()
  .min(9, "Must be more than 8 characters")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/[^A-Za-z0-9]/, "Must include a special character");

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  type: z.string().min(1, "Select a product type"),
  salesPrice: z.coerce.number().min(0, "Must be 0 or more"),
  costPrice: z.coerce.number().min(0, "Must be 0 or more"),
  notes: z.string().optional(),
});

export const variantSchema = z.object({
  brand: z.string().min(1, "Brand name is required"),
  priceDelta: z.coerce.number({ invalid_type_error: "Enter a valid number" }),
});

export const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  productId: z.string().min(1, "Select a product"),
  period: z.enum(["daily", "weekly", "monthly", "yearly"]),
  minQty: z.coerce.number().int().min(1, "Minimum 1"),
  price: z.coerce.number().min(0, "Must be 0 or more"),
  availableFrom: z.string().min(1, "Start date is required"),
  availableTo: z.string().optional(),
  autoClose: z.boolean(),
  closable: z.boolean(),
  pausable: z.boolean(),
  renewable: z.boolean(),
});

export const discountSchema = z.object({
  name: z.string().min(1, "Discount name is required"),
  type: z.enum(["fixed", "percent"]),
  value: z.coerce.number().min(0, "Must be 0 or more"),
  minPurchase: z.coerce.number().min(0).optional(),
  minQty: z.coerce.number().int().min(0).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  usageLimit: z.coerce.number().int().min(0).optional(),
  scope: z.enum(["product", "subscription"]),
});

export const taxSchema = z.object({
  name: z.string().min(1, "Tax name is required"),
  type: z.enum(["CGST", "SGST", "IGST"]),
  rate: z.coerce.number().min(0).max(100, "Rate must be 0 to 100"),
  state: z.string().optional(),
});

export const paymentSchema = z.object({
  method: z.enum(["UPI", "NetBanking", "Card", "Cash", "Bank"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  note: z.string().optional(),
  invoiceId: z.string().min(1, "Invoice is required"),
});

export const staffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: passwordSchema,
});

export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  state: z.string().min(1, "State is required for GST"),
  company: z.string().optional(),
  gstin: z.string().optional(),
});

export const subscriptionTransitionSchema = z.object({
  to: z.enum(["Draft", "Quotation", "Confirmed", "Active", "Closed"]),
});

export const invoiceTransitionSchema = z.object({
  to: z.enum(["Draft", "Confirmed", "Paid"]),
});

// Re-export inferred types
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
export type PlanInput = z.infer<typeof planSchema>;
export type DiscountInput = z.infer<typeof discountSchema>;
export type TaxInput = z.infer<typeof taxSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type StaffInput = z.infer<typeof staffSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
