export type ApiHealthResponse = {
  service: string;
  status: "ok";
};

import type { AuthUser, CompanyProfile, OrganizationSummary } from "../types";

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
