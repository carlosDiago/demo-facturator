import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import type {
  PaymentResponse,
  PaymentsListResponse,
} from "@demo-facturator/shared";
import type { AuthenticatedRequest } from "../../common/auth-request";
import { CurrentAuth } from "../../common/current-auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { AuthService } from "../auth/auth.service";
import { PaymentsService } from "./payments.service";

@Controller("invoices/:invoiceId/payments")
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(
    private readonly authService: AuthService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Get()
  async list(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("invoiceId") invoiceId: string,
  ): Promise<PaymentsListResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.paymentsService.list(organization.id, invoiceId);
  }

  @Post()
  async create(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("invoiceId") invoiceId: string,
    @Body() body: unknown,
  ): Promise<PaymentResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.paymentsService.create(organization.id, invoiceId, auth.user.id, body);
  }
}
