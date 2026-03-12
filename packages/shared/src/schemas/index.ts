import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const personTypeSchema = z.enum(["self_employed", "company"]);

export const organizationSchema = z.object({
  displayName: z.string().min(2).max(255),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;

export const companyProfileSchema = z.object({
  personType: personTypeSchema,
  legalName: z.string().min(2).max(255),
  tradeName: z.string().max(255).trim().optional().nullable(),
  taxId: z.string().min(8).max(32),
  addressLine1: z.string().min(3).max(255),
  addressLine2: z.string().max(255).trim().optional().nullable(),
  postalCode: z.string().min(4).max(16),
  city: z.string().min(2).max(120),
  province: z.string().min(2).max(120),
  countryCode: z.string().length(2).default("ES"),
  defaultVatRate: z.coerce.number().min(0).max(100),
  defaultIrpfRate: z.coerce.number().min(0).max(100),
  paymentMessage: z.string().max(1000).trim().optional().nullable(),
  iban: z.string().max(34).trim().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(32).trim().optional().nullable(),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;

export const clientTypeSchema = z.enum(["individual", "company"]);

export const clientSchema = z.object({
  clientType: clientTypeSchema.default("company"),
  legalName: z.string().min(2).max(255),
  taxId: z.string().min(8).max(32).trim().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(32).trim().optional().nullable(),
  addressLine1: z.string().min(3).max(255),
  addressLine2: z.string().max(255).trim().optional().nullable(),
  postalCode: z.string().min(4).max(16),
  city: z.string().min(2).max(120),
  province: z.string().min(2).max(120),
  countryCode: z.string().length(2).default("ES"),
  notes: z.string().max(1000).trim().optional().nullable(),
});

export type ClientInput = z.infer<typeof clientSchema>;

export const invoiceSeriesSchema = z.object({
  code: z.string().min(1).max(40).trim(),
  name: z.string().min(2).max(120).trim(),
  prefix: z.string().max(40).trim().optional().nullable(),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export type InvoiceSeriesInput = z.infer<typeof invoiceSeriesSchema>;

export const invoiceItemSchema = z.object({
  description: z.string().min(2).max(1000),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
  discountRate: z.coerce.number().min(0).max(100).default(0),
  vatRate: z.coerce.number().min(0).max(100).default(21),
  irpfRate: z.coerce.number().min(0).max(100).default(0),
});

export const draftInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  seriesId: z.string().uuid(),
  issueDate: z.string().date(),
  dueDate: z.string().date().optional().nullable(),
  notes: z.string().max(2000).trim().optional().nullable(),
  paymentTerms: z.string().max(2000).trim().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1),
});

export type DraftInvoiceInput = z.infer<typeof draftInvoiceSchema>;

export const cancelInvoiceSchema = z.object({
  reason: z.string().min(5).max(1000),
});

export type CancelInvoiceInput = z.infer<typeof cancelInvoiceSchema>;
