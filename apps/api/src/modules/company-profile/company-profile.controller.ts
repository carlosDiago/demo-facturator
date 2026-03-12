import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import type { CompanyProfileResponse } from "@demo-facturator/shared";
import type { AuthenticatedRequest } from "../../common/auth-request";
import { CurrentAuth } from "../../common/current-auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { AuthService } from "../auth/auth.service";
import { CompanyProfileService } from "./company-profile.service";

@Controller("company-profile")
@UseGuards(AuthGuard)
export class CompanyProfileController {
  constructor(
    private readonly authService: AuthService,
    private readonly companyProfileService: CompanyProfileService,
  ) {}

  @Get()
  async getProfile(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
  ): Promise<CompanyProfileResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);

    return this.companyProfileService.getCurrent(organization.id);
  }

  @Put()
  async upsertProfile(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Body() body: unknown,
  ): Promise<CompanyProfileResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);

    return this.companyProfileService.upsert(organization.id, body);
  }
}
