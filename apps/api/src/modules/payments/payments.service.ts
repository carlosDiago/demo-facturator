import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  auditLogs,
  invoices,
  payments,
  type DatabaseClient,
} from "@demo-facturator/database";
import {
  createPaymentSchema,
  type PaymentResponse,
  type PaymentsListResponse,
} from "@demo-facturator/shared";
import { and, asc, eq } from "drizzle-orm";
import { DATABASE_CLIENT } from "../database/database.constants";

@Injectable()
export class PaymentsService {
  constructor(@Inject(DATABASE_CLIENT) private readonly db: DatabaseClient) {}

  async list(organizationId: string, invoiceId: string): Promise<PaymentsListResponse> {
    await this.getInvoiceOrThrow(organizationId, invoiceId);

    const rows = await this.db.query.payments.findMany({
      where: (table, operators) =>
        operators.and(
          operators.eq(table.organizationId, organizationId),
          operators.eq(table.invoiceId, invoiceId),
        ),
      orderBy: [asc(payments.paymentDate), asc(payments.createdAt)],
    });

    return {
      payments: rows.map(mapPayment),
    };
  }

  async create(
    organizationId: string,
    invoiceId: string,
    userId: string,
    body: unknown,
  ): Promise<PaymentResponse> {
    const input = createPaymentSchema.parse(body);
    const invoice = await this.getInvoiceOrThrow(organizationId, invoiceId);

    if (invoice.status === "draft") {
      throw new BadRequestException("No se pueden registrar pagos sobre borradores");
    }

    if (invoice.status === "cancelled") {
      throw new BadRequestException("No se pueden registrar pagos sobre facturas canceladas");
    }

    if (invoice.status === "paid") {
      throw new BadRequestException("La factura ya esta completamente pagada");
    }

    const pendingAmount = Number(invoice.amountDue);

    if (input.amount > pendingAmount) {
      throw new BadRequestException("El pago supera el importe pendiente");
    }

    return this.db.transaction(async (tx) => {
      const [createdPayment] = await tx
        .insert(payments)
        .values({
          organizationId,
          invoiceId,
          paymentDate: input.paymentDate,
          amount: toAmount(input.amount),
          method: input.method,
          reference: input.reference ?? null,
          notes: input.notes ?? null,
          createdByUserId: userId,
        })
        .returning();

      const relatedPayments = await tx.query.payments.findMany({
        where: (table: any, operators: any) =>
          operators.and(
            operators.eq(table.organizationId, organizationId),
            operators.eq(table.invoiceId, invoiceId),
          ),
      });

      const amountPaid = round(
        relatedPayments.reduce((sum: number, item: typeof payments.$inferSelect) => {
          return sum + Number(item.amount);
        }, 0),
      );
      const totalAmount = Number(invoice.totalAmount);
      const amountDue = round(totalAmount - amountPaid);
      const nextStatus = amountDue === 0 ? "paid" : "partially_paid";

      await tx
        .update(invoices)
        .set({
          amountPaid: toAmount(amountPaid),
          amountDue: toAmount(amountDue),
          status: nextStatus,
          paidAt: amountDue === 0 ? new Date() : null,
          updatedByUserId: userId,
          updatedAt: new Date(),
        })
        .where(and(eq(invoices.id, invoiceId), eq(invoices.organizationId, organizationId)));

      await tx.insert(auditLogs).values({
        organizationId,
        actorUserId: userId,
        entityType: "invoice",
        entityId: invoiceId,
        action: "payment_registered",
        metadataJson: {
          paymentId: createdPayment.id,
          amount: createdPayment.amount,
          status: nextStatus,
        },
      });

      const updatedInvoice = await tx.query.invoices.findFirst({
        where: (table: any, operators: any) =>
          operators.and(
            operators.eq(table.id, invoiceId),
            operators.eq(table.organizationId, organizationId),
          ),
        with: {
          invoiceItems: {
            orderBy: (table: any, operators: any) => [operators.asc(table.sortOrder)],
          },
        },
      });

      if (!updatedInvoice) {
        throw new NotFoundException("Factura no encontrada tras registrar el pago");
      }

      return {
        payment: mapPayment(createdPayment),
        invoice: mapInvoice(updatedInvoice as InvoiceWithItems),
      };
    });
  }

  private async getInvoiceOrThrow(organizationId: string, invoiceId: string) {
    const invoice = await this.db.query.invoices.findFirst({
      where: (table, operators) =>
        operators.and(
          operators.eq(table.id, invoiceId),
          operators.eq(table.organizationId, organizationId),
        ),
    });

    if (!invoice) {
      throw new NotFoundException("Factura no encontrada");
    }

    return invoice;
  }
}

type InvoiceWithItems = typeof invoices.$inferSelect & {
  invoiceItems: Array<{
    id: string;
    sortOrder: number;
    description: string;
    quantity: string;
    unitPrice: string;
    discountRate: string;
    vatRate: string;
    irpfRate: string;
    lineSubtotal: string;
    lineVatAmount: string;
    lineIrpfAmount: string;
    lineTotal: string;
  }>;
};

function mapPayment(payment: typeof payments.$inferSelect) {
  return {
    id: payment.id,
    invoiceId: payment.invoiceId,
    organizationId: payment.organizationId,
    paymentDate: payment.paymentDate,
    amount: payment.amount,
    method: payment.method,
    reference: payment.reference,
    notes: payment.notes,
  };
}

function mapInvoice(invoice: InvoiceWithItems) {
  return {
    id: invoice.id,
    organizationId: invoice.organizationId,
    seriesId: invoice.seriesId,
    clientId: invoice.clientId,
    number: invoice.number,
    fullNumber: invoice.fullNumber,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    currencyCode: invoice.currencyCode,
    notes: invoice.notes,
    paymentTerms: invoice.paymentTerms,
    subtotalAmount: invoice.subtotalAmount,
    vatAmount: invoice.vatAmount,
    irpfAmount: invoice.irpfAmount,
    totalAmount: invoice.totalAmount,
    amountPaid: invoice.amountPaid,
    amountDue: invoice.amountDue,
    issuedAt: invoice.issuedAt?.toISOString() ?? null,
    cancelledAt: invoice.cancelledAt?.toISOString() ?? null,
    cancellationReason: invoice.cancellationReason,
    items: invoice.invoiceItems.map((item) => ({
      id: item.id,
      sortOrder: item.sortOrder,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountRate: item.discountRate,
      vatRate: item.vatRate,
      irpfRate: item.irpfRate,
      lineSubtotal: item.lineSubtotal,
      lineVatAmount: item.lineVatAmount,
      lineIrpfAmount: item.lineIrpfAmount,
      lineTotal: item.lineTotal,
    })),
  };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function toAmount(value: number) {
  return value.toFixed(2);
}
