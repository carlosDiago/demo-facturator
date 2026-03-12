import type { OrganizationSummary } from "@demo-facturator/shared";
import type { Request } from "express";

export type AuthenticatedUser = {
  id: string;
  email: string;
  fullName: string;
};

export type AuthenticatedRequest = Request & {
  auth?: {
    sessionId: string;
    user: AuthenticatedUser;
    organization: OrganizationSummary | null;
  };
};
