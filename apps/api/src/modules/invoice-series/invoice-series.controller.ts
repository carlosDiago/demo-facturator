import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import type {
  InvoiceSeriesListResponse,
  InvoiceSeriesResponse,
} from "@demo-facturator/shared";
import type { AuthenticatedRequest } from "../../common/auth-request";
import { CurrentAuth } from "../../common/current-auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { AuthService } from "../auth/auth.service";
import { InvoiceSeriesService } from "./invoice-series.service";

@Controller("invoice-series")
@UseGuards(AuthGuard)
export class InvoiceSeriesController {
  constructor(
    private readonly authService: AuthService,
    private readonly invoiceSeriesService: InvoiceSeriesService,
  ) {}

  @Get()
  async list(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
  ): Promise<InvoiceSeriesListResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.invoiceSeriesService.list(organization.id);
  }

  @Get(":id")
  async getById(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("id") id: string,
  ): Promise<InvoiceSeriesResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.invoiceSeriesService.getById(organization.id, id);
  }

  @Post()
  async create(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Body() body: unknown,
  ): Promise<InvoiceSeriesResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.invoiceSeriesService.create(organization.id, body);
  }

  @Put(":id")
  async update(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("id") id: string,
    @Body() body: unknown,
  ): Promise<InvoiceSeriesResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.invoiceSeriesService.update(organization.id, id, body);
  }

  @Post(":id/set-default")
  async setDefault(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("id") id: string,
  ): Promise<InvoiceSeriesResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.invoiceSeriesService.setDefault(organization.id, id);
  }
}
