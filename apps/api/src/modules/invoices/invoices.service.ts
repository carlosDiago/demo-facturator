import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  clients,
  invoiceItems,
  invoices,
  invoiceSeries,
  type DatabaseClient,
} from "@demo-facturator/database";
import {
  draftInvoiceSchema,
  type DraftInvoiceInput,
  type InvoiceResponse,
  type InvoicesListResponse,
} from "@demo-facturator/shared";
import { and, asc, desc, eq } from "drizzle-orm";
import { DATABASE_CLIENT } from "../database/database.constants";

@Injectable()
export class InvoicesService {
  constructor(@Inject(DATABASE_CLIENT) private readonly db: DatabaseClient) {}

  async list(organizationId: string): Promise<InvoicesListResponse> {
    const rows = await this.db.query.invoices.findMany({
      where: (table, operators) => operators.eq(table.organizationId, organizationId),
      orderBy: [desc(invoices.createdAt)],
      with: {
        invoiceItems: {
          orderBy: [asc(invoiceItems.sortOrder)],
        },
      },
    });

    return {
      invoices: rows.map(mapInvoice),
    };
  }

  async getById(organizationId: string, id: string): Promise<InvoiceResponse> {
    const invoice = await this.findInvoice(organizationId, id);
    return { invoice: mapInvoice(invoice) };
  }

  async create(organizationId: string, userId: string, body: unknown): Promise<InvoiceResponse> {
    const input = draftInvoiceSchema.parse(body);
    await this.ensureRelations(organizationId, input.clientId, input.seriesId);
    const totals = calculateTotals(input);

    return this.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(invoices)
        .values({
          organizationId,
          clientId: input.clientId,
          seriesId: input.seriesId,
          issueDate: input.issueDate,
          dueDate: input.dueDate ?? null,
          notes: input.notes ?? null,
          paymentTerms: input.paymentTerms ?? null,
          subtotalAmount: toAmount(totals.subtotal),
          vatAmount: toAmount(totals.vat),
          irpfAmount: toAmount(totals.irpf),
          totalAmount: toAmount(totals.total),
          amountPaid: "0.00",
          amountDue: toAmount(totals.total),
          createdByUserId: userId,
          updatedByUserId: userId,
        })
        .returning();

      await tx.insert(invoiceItems).values(
        totals.items.map((item, index) => ({
          invoiceId: created.id,
          sortOrder: index,
          description: item.description,
          quantity: toAmount(item.quantity),
          unitPrice: toAmount(item.unitPrice),
          discountRate: toRate(item.discountRate),
          vatRate: toRate(item.vatRate),
          irpfRate: toRate(item.irpfRate),
          lineSubtotal: toAmount(item.lineSubtotal),
          lineVatAmount: toAmount(item.lineVatAmount),
          lineIrpfAmount: toAmount(item.lineIrpfAmount),
          lineTotal: toAmount(item.lineTotal),
        })),
      );

      const fullInvoice = await tx.query.invoices.findFirst({
        where: (table, operators) => operators.eq(table.id, created.id),
        with: {
          invoiceItems: {
            orderBy: [asc(invoiceItems.sortOrder)],
          },
        },
      });

      if (!fullInvoice) {
        throw new NotFoundException("Factura no encontrada tras crearla");
      }

      return { invoice: mapInvoice(fullInvoice) };
    });
  }

  async update(
    organizationId: string,
    userId: string,
    id: string,
    body: unknown,
  ): Promise<InvoiceResponse> {
    const existing = await this.findInvoice(organizationId, id);

    if (existing.status !== "draft") {
      throw new BadRequestException("Solo se pueden editar facturas en borrador");
    }

    const input = draftInvoiceSchema.parse(body);
    await this.ensureRelations(organizationId, input.clientId, input.seriesId);
    const totals = calculateTotals(input);

    return this.db.transaction(async (tx) => {
      await tx
        .update(invoices)
        .set({
          clientId: input.clientId,
          seriesId: input.seriesId,
          issueDate: input.issueDate,
          dueDate: input.dueDate ?? null,
          notes: input.notes ?? null,
          paymentTerms: input.paymentTerms ?? null,
          subtotalAmount: toAmount(totals.subtotal),
          vatAmount: toAmount(totals.vat),
          irpfAmount: toAmount(totals.irpf),
          totalAmount: toAmount(totals.total),
          amountDue: toAmount(totals.total),
          updatedByUserId: userId,
          updatedAt: new Date(),
        })
        .where(and(eq(invoices.id, id), eq(invoices.organizationId, organizationId)));

      await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));

      await tx.insert(invoiceItems).values(
        totals.items.map((item, index) => ({
          invoiceId: id,
          sortOrder: index,
          description: item.description,
          quantity: toAmount(item.quantity),
          unitPrice: toAmount(item.unitPrice),
          discountRate: toRate(item.discountRate),
          vatRate: toRate(item.vatRate),
          irpfRate: toRate(item.irpfRate),
          lineSubtotal: toAmount(item.lineSubtotal),
          lineVatAmount: toAmount(item.lineVatAmount),
          lineIrpfAmount: toAmount(item.lineIrpfAmount),
          lineTotal: toAmount(item.lineTotal),
        })),
      );

      const fullInvoice = await tx.query.invoices.findFirst({
        where: (table, operators) => operators.eq(table.id, id),
        with: {
          invoiceItems: {
            orderBy: [asc(invoiceItems.sortOrder)],
          },
        },
      });

      if (!fullInvoice) {
        throw new NotFoundException("Factura no encontrada tras actualizarla");
      }

      return { invoice: mapInvoice(fullInvoice) };
    });
  }

  async remove(organizationId: string, id: string): Promise<void> {
    const existing = await this.findInvoice(organizationId, id);

    if (existing.status !== "draft") {
      throw new BadRequestException("Solo se pueden borrar facturas en borrador");
    }

    await this.db.delete(invoices).where(and(eq(invoices.id, id), eq(invoices.organizationId, organizationId)));
  }

  async duplicate(organizationId: string, userId: string, id: string): Promise<InvoiceResponse> {
    const existing = await this.findInvoice(organizationId, id);
    const full = mapInvoice(existing);

    return this.create(organizationId, userId, {
      clientId: full.clientId,
      seriesId: full.seriesId,
      issueDate: full.issueDate,
      dueDate: full.dueDate,
      notes: full.notes,
      paymentTerms: full.paymentTerms,
      items: full.items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discountRate: Number(item.discountRate),
        vatRate: Number(item.vatRate),
        irpfRate: Number(item.irpfRate),
      })),
    });
  }

  private async ensureRelations(organizationId: string, clientId: string, seriesId: string) {
    const client = await this.db.query.clients.findFirst({
      where: (table, operators) =>
        operators.and(
          operators.eq(table.id, clientId),
          operators.eq(table.organizationId, organizationId),
          operators.eq(table.isActive, true),
        ),
    });

    if (!client) {
      throw new NotFoundException("Cliente no valido para esta organizacion");
    }

    const series = await this.db.query.invoiceSeries.findFirst({
      where: (table, operators) =>
        operators.and(
          operators.eq(table.id, seriesId),
          operators.eq(table.organizationId, organizationId),
          operators.eq(table.isActive, true),
        ),
    });

    if (!series) {
      throw new NotFoundException("Serie no valida para esta organizacion");
    }
  }

  private async findInvoice(organizationId: string, id: string) {
    const invoice = await this.db.query.invoices.findFirst({
      where: (table, operators) =>
        operators.and(
          operators.eq(table.id, id),
          operators.eq(table.organizationId, organizationId),
        ),
      with: {
        invoiceItems: {
          orderBy: [asc(invoiceItems.sortOrder)],
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException("Factura no encontrada");
    }

    return invoice;
  }
}

function calculateTotals(input: DraftInvoiceInput) {
  const items = input.items.map((item) => {
    const base = round(item.quantity * item.unitPrice);
    const discount = round(base * (item.discountRate / 100));
    const subtotal = round(base - discount);
    const vat = round(subtotal * (item.vatRate / 100));
    const irpf = round(subtotal * (item.irpfRate / 100));
    const total = round(subtotal + vat - irpf);

    return {
      ...item,
      lineSubtotal: subtotal,
      lineVatAmount: vat,
      lineIrpfAmount: irpf,
      lineTotal: total,
    };
  });

  const subtotal = round(items.reduce((sum, item) => sum + item.lineSubtotal, 0));
  const vat = round(items.reduce((sum, item) => sum + item.lineVatAmount, 0));
  const irpf = round(items.reduce((sum, item) => sum + item.lineIrpfAmount, 0));
  const total = round(subtotal + vat - irpf);

  return {
    items,
    subtotal,
    vat,
    irpf,
    total,
  };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function toAmount(value: number) {
  return value.toFixed(2);
}

function toRate(value: number) {
  return value.toFixed(2);
}

function mapInvoice(invoice: typeof invoices.$inferSelect & { invoiceItems: typeof invoiceItems.$inferSelect[] }) {
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
