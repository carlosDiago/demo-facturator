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
