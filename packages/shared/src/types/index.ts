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

export type ClientType = "individual" | "company";

export type Client = {
  id: string;
  organizationId: string;
  clientType: ClientType;
  legalName: string;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string;
  city: string;
  province: string;
  countryCode: string;
  notes: string | null;
  isActive: boolean;
};

export type InvoiceSeries = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  prefix: string | null;
  currentNumber: number;
  isDefault: boolean;
  isActive: boolean;
};

export type InvoiceItem = {
  id: string;
  sortOrder: number;
  description: string;
  quantity: string;
  unitPrice: string;
  discountRate: string;
  vatRate: string;
  irpfRate: string;
  lineSubtotal: string;
  lineVatAmount: string;
  lineIrpfAmount: string;
  lineTotal: string;
};

export type Invoice = {
  id: string;
  organizationId: string;
  seriesId: string;
  clientId: string;
  number: number | null;
  fullNumber: string | null;
  issueDate: string;
  dueDate: string | null;
  status: InvoiceStatus;
  currencyCode: string;
  notes: string | null;
  paymentTerms: string | null;
  subtotalAmount: string;
  vatAmount: string;
  irpfAmount: string;
  totalAmount: string;
  amountPaid: string;
  amountDue: string;
  issuedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  items: InvoiceItem[];
};
