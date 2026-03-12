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
  AuditLogListResponse,
  InvoiceActionResponse,
  InvoiceResponse,
  InvoicesListResponse,
} from "@demo-facturator/shared";
import type { AuthenticatedRequest } from "../../common/auth-request";
import { CurrentAuth } from "../../common/current-auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { AuthService } from "../auth/auth.service";
import { InvoicesService } from "./invoices.service";
import type { Response } from "express";
import { Res } from "@nestjs/common";

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

  @Get(":id/audit")
  async audit(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("id") id: string,
  ): Promise<AuditLogListResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.invoicesService.getAuditLogs(organization.id, id);
  }

  @Get(":id/pdf")
  async pdf(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("id") id: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Buffer> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    const pdf = await this.invoicesService.generatePdf(organization.id, id);

    response.setHeader("Content-Type", "application/pdf");
    response.setHeader(
      "Content-Disposition",
      `inline; filename="factura-${id}.pdf"`,
    );

    return pdf;
  }
}
