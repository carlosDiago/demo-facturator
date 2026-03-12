export type PersonType = "self_employed" | "company";

export type OrganizationMemberRole = "owner" | "admin" | "member";

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "partially_paid"
  | "paid"
  | "cancelled";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
};

export type OrganizationSummary = {
  id: string;
  slug: string;
  displayName: string;
  role: OrganizationMemberRole;
};

export type CompanyProfile = {
  id: string;
  organizationId: string;
  personType: PersonType;
  legalName: string;
  tradeName: string | null;
  taxId: string;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string;
  city: string;
  province: string;
  countryCode: string;
  defaultVatRate: string;
  defaultIrpfRate: string;
  paymentMessage: string | null;
  iban: string | null;
  email: string | null;
  phone: string | null;
};
