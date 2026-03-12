export type ApiHealthResponse = {
  service: string;
  status: "ok";
};

import type {
  AuthUser,
  AuditLog,
  Client,
  CompanyProfile,
  Invoice,
  InvoiceSeries,
  OrganizationSummary,
  Payment,
} from "../types";

export type AuthSessionResponse = {
  user: AuthUser;
  organization: OrganizationSummary | null;
};

export type CurrentOrganizationResponse = {
  organization: OrganizationSummary;
};

export type CompanyProfileResponse = {
  profile: CompanyProfile | null;
};

export type ClientResponse = {
  client: Client;
};

export type ClientsListResponse = {
  clients: Client[];
};

export type InvoiceSeriesResponse = {
  series: InvoiceSeries;
};

export type InvoiceSeriesListResponse = {
  series: InvoiceSeries[];
};

export type InvoiceResponse = {
  invoice: Invoice;
};

export type InvoicesListResponse = {
  invoices: Invoice[];
};

export type InvoiceActionResponse = {
  invoice: Invoice;
  message: string;
};

export type PaymentsListResponse = {
  payments: Payment[];
};

export type PaymentResponse = {
  payment: Payment;
  invoice: Invoice;
};

export type AuditLogListResponse = {
  auditLogs: AuditLog[];
};
