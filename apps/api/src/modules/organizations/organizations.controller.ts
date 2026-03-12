import { Body, Controller, Get, NotFoundException, Post, UseGuards } from "@nestjs/common";
import type { CurrentOrganizationResponse } from "@demo-facturator/shared";
import type { AuthenticatedRequest } from "../../common/auth-request";
import { CurrentAuth } from "../../common/current-auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { OrganizationsService } from "./organizations.service";

@Controller("organizations")
@UseGuards(AuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get("current")
  async current(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
  ): Promise<CurrentOrganizationResponse> {
    const result = await this.organizationsService.getCurrent(auth.user.id);

    if (!result) {
      throw new NotFoundException("No hay organizacion activa");
    }

    return result;
  }

  @Post()
  create(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Body() body: unknown,
  ) {
    return this.organizationsService.createForUser(auth.user.id, body);
  }
}
