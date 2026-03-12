import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import type {
  InvoiceActionResponse,
  InvoiceResponse,
  InvoicesListResponse,
} from "@demo-facturator/shared";
import type { AuthenticatedRequest } from "../../common/auth-request";
import { CurrentAuth } from "../../common/current-auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { AuthService } from "../auth/auth.service";
import { InvoicesService } from "./invoices.service";

@Controller("invoices")
@UseGuards(AuthGuard)
export class InvoicesController {
  constructor(
    private readonly authService: AuthService,
    private readonly invoicesService: InvoicesService,
  ) {}

  @Get()
  async list(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
  ): Promise<InvoicesListResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.invoicesService.list(organization.id);
  }

  @Get(":id")
  async getById(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("id") id: string,
  ): Promise<InvoiceResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.invoicesService.getById(organization.id, id);
  }

  @Post()
  async create(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Body() body: unknown,
  ): Promise<InvoiceResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.invoicesService.create(organization.id, auth.user.id, body);
  }

  @Put(":id")
  async update(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("id") id: string,
    @Body() body: unknown,
  ): Promise<InvoiceResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.invoicesService.update(organization.id, auth.user.id, id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("id") id: string,
  ): Promise<void> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    await this.invoicesService.remove(organization.id, id);
  }

  @Post(":id/duplicate")
  async duplicate(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("id") id: string,
  ): Promise<InvoiceResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.invoicesService.duplicate(organization.id, auth.user.id, id);
  }

  @Post(":id/issue")
  async issue(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("id") id: string,
  ): Promise<InvoiceActionResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.invoicesService.issue(organization.id, auth.user.id, id);
  }

  @Post(":id/cancel")
  async cancel(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("id") id: string,
    @Body() body: unknown,
  ): Promise<InvoiceActionResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.invoicesService.cancel(organization.id, auth.user.id, id, body);
  }
}
