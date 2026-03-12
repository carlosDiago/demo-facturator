export type ApiHealthResponse = {
  service: string;
  status: "ok";
};

import type {
  AuthUser,
  Client,
  CompanyProfile,
  Invoice,
  InvoiceSeries,
  OrganizationSummary,
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
