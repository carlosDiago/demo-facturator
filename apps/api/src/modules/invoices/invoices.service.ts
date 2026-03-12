import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  auditLogs,
  clients,
  companyProfiles,
  invoiceItems,
  invoices,
  invoiceSeries,
  payments,
  type DatabaseClient,
} from "@demo-facturator/database";
import {
  type AuditLogListResponse,
  cancelInvoiceSchema,
  draftInvoiceSchema,
  type DraftInvoiceInput,
  type InvoiceActionResponse,
  type InvoiceResponse,
  type InvoicesListResponse,
} from "@demo-facturator/shared";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import PDFDocument from "pdfkit";
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

      const fullInvoice = await this.findInvoiceWithTx(tx, created.id);

      await tx.insert(auditLogs).values({
        organizationId,
        actorUserId: userId,
        entityType: "invoice",
        entityId: created.id,
        action: "invoice_created",
        metadataJson: { status: "draft" },
      });

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

      const fullInvoice = await this.findInvoiceWithTx(tx, id);

      await tx.insert(auditLogs).values({
        organizationId,
        actorUserId: userId,
        entityType: "invoice",
        entityId: id,
        action: "invoice_updated",
        metadataJson: { status: "draft" },
      });

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

    const duplicated = await this.create(organizationId, userId, {
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

    await this.db.insert(auditLogs).values({
      organizationId,
      actorUserId: userId,
      entityType: "invoice",
      entityId: duplicated.invoice.id,
      action: "invoice_duplicated",
      metadataJson: { sourceInvoiceId: id },
    });

    return duplicated;
  }

  async issue(
    organizationId: string,
    userId: string,
    id: string,
  ): Promise<InvoiceActionResponse> {
    const existing = await this.findInvoice(organizationId, id);

    if (existing.status !== "draft") {
      throw new BadRequestException("Solo se pueden emitir facturas en borrador");
    }

    if (existing.invoiceItems.length === 0) {
      throw new BadRequestException("La factura debe tener al menos una linea");
    }

    const issuer = await this.db.query.companyProfiles.findFirst({
      where: (table, operators) => operators.eq(table.organizationId, organizationId),
    });

    if (!issuer) {
      throw new BadRequestException("No hay perfil fiscal configurado para emitir");
    }

    const client = await this.db.query.clients.findFirst({
      where: (table, operators) =>
        operators.and(
          operators.eq(table.id, existing.clientId),
          operators.eq(table.organizationId, organizationId),
          operators.eq(table.isActive, true),
        ),
    });

    if (!client) {
      throw new BadRequestException("El cliente asociado ya no esta disponible");
    }

    return this.db.transaction(async (tx) => {
      const [updatedSeries] = await tx
        .update(invoiceSeries)
        .set({
          currentNumber: sql`${invoiceSeries.currentNumber} + 1`,
          updatedAt: new Date(),
        })
        .where(and(eq(invoiceSeries.id, existing.seriesId), eq(invoiceSeries.organizationId, organizationId)))
        .returning({
          currentNumber: invoiceSeries.currentNumber,
          prefix: invoiceSeries.prefix,
          code: invoiceSeries.code,
        });

      if (!updatedSeries) {
        throw new NotFoundException("Serie no encontrada para emitir");
      }

      const nextNumber = updatedSeries.currentNumber;
      const fullNumber = `${updatedSeries.prefix || updatedSeries.code}-${nextNumber}`;

      await tx
        .update(invoices)
        .set({
          number: nextNumber,
          fullNumber,
          status: "issued",
          issuedAt: new Date(),
          issuedByUserId: userId,
          amountDue: existing.totalAmount,
          issuerLegalName: issuer.legalName,
          issuerTaxId: issuer.taxId,
          issuerAddressLine1: issuer.addressLine1,
          issuerPostalCode: issuer.postalCode,
          issuerCity: issuer.city,
          issuerProvince: issuer.province,
          issuerCountryCode: issuer.countryCode,
          clientLegalName: client.legalName,
          clientTaxId: client.taxId,
          clientAddressLine1: client.addressLine1,
          clientPostalCode: client.postalCode,
          clientCity: client.city,
          clientProvince: client.province,
          clientCountryCode: client.countryCode,
          updatedByUserId: userId,
          updatedAt: new Date(),
        })
        .where(and(eq(invoices.id, id), eq(invoices.organizationId, organizationId)));

      await tx.insert(auditLogs).values({
        organizationId,
        actorUserId: userId,
        entityType: "invoice",
        entityId: id,
        action: "invoice_issued",
        metadataJson: { fullNumber, number: nextNumber },
      });

      const fullInvoice = await this.findInvoiceWithTx(tx, id);

      return {
        invoice: mapInvoice(fullInvoice),
        message: `Factura emitida como ${fullNumber}`,
      };
    });
  }

  async cancel(
    organizationId: string,
    userId: string,
    id: string,
    body: unknown,
  ): Promise<InvoiceActionResponse> {
    const existing = await this.findInvoice(organizationId, id);

    if (existing.status !== "issued") {
      throw new BadRequestException("Solo se pueden cancelar facturas emitidas sin pagos");
    }

    const input = cancelInvoiceSchema.parse(body);

    const relatedPayment = await this.db.query.payments.findFirst({
      where: (table, operators) =>
        operators.and(
          operators.eq(table.invoiceId, id),
          operators.eq(table.organizationId, organizationId),
        ),
    });

    if (relatedPayment) {
      throw new BadRequestException("No se puede cancelar una factura con pagos registrados");
    }

    return this.db.transaction(async (tx) => {
      await tx
        .update(invoices)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
          cancelledByUserId: userId,
          cancellationReason: input.reason,
          updatedByUserId: userId,
          updatedAt: new Date(),
        })
        .where(and(eq(invoices.id, id), eq(invoices.organizationId, organizationId)));

      await tx.insert(auditLogs).values({
        organizationId,
        actorUserId: userId,
        entityType: "invoice",
        entityId: id,
        action: "invoice_cancelled",
        metadataJson: { reason: input.reason },
      });

      const fullInvoice = await this.findInvoiceWithTx(tx, id);

      return {
        invoice: mapInvoice(fullInvoice),
        message: "Factura cancelada correctamente",
      };
    });
  }

  async getAuditLogs(organizationId: string, id: string): Promise<AuditLogListResponse> {
    await this.findInvoice(organizationId, id);

    const rows = await this.db.query.auditLogs.findMany({
      where: (table, operators) =>
        operators.and(
          operators.eq(table.organizationId, organizationId),
          operators.eq(table.entityType, "invoice"),
          operators.eq(table.entityId, id),
        ),
      orderBy: [desc(auditLogs.createdAt)],
    });

    return {
      auditLogs: rows.map((row) => ({
        id: row.id,
        entityType: row.entityType,
        entityId: row.entityId,
        action: row.action,
        createdAt: row.createdAt.toISOString(),
        metadata: (row.metadataJson as Record<string, unknown>) ?? {},
      })),
    };
  }

  async generatePdf(organizationId: string, id: string): Promise<Buffer> {
    const invoice = await this.findInvoice(organizationId, id);

    if (invoice.status === "draft") {
      throw new BadRequestException("Solo se puede generar PDF de facturas emitidas o posteriores");
    }

    const pdf = new PDFDocument({ margin: 48, size: "A4" });
    const chunks: Buffer[] = [];

    pdf.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

    pdf.fontSize(22).text("Factura", { align: "left" });
    pdf.moveDown(0.5);
    pdf.fontSize(12).text(`Numero: ${invoice.fullNumber ?? "Pendiente"}`);
    pdf.text(`Estado: ${invoice.status}`);
    pdf.text(`Fecha de emision: ${invoice.issueDate}`);
    if (invoice.dueDate) {
      pdf.text(`Vencimiento: ${invoice.dueDate}`);
    }

    pdf.moveDown();
    pdf.fontSize(14).text("Emisor", { underline: true });
    pdf.fontSize(11).text(invoice.issuerLegalName ?? "-");
    pdf.text(invoice.issuerTaxId ?? "-");
    pdf.text(invoice.issuerAddressLine1 ?? "-");
    pdf.text(
      [invoice.issuerPostalCode, invoice.issuerCity, invoice.issuerProvince]
        .filter(Boolean)
        .join(" "),
    );

    pdf.moveDown();
    pdf.fontSize(14).text("Cliente", { underline: true });
    pdf.fontSize(11).text(invoice.clientLegalName ?? "-");
    pdf.text(invoice.clientTaxId ?? "-");
    pdf.text(invoice.clientAddressLine1 ?? "-");
    pdf.text(
      [invoice.clientPostalCode, invoice.clientCity, invoice.clientProvince]
        .filter(Boolean)
        .join(" "),
    );

    pdf.moveDown();
    pdf.fontSize(14).text("Conceptos", { underline: true });
    pdf.moveDown(0.5);

    invoice.invoiceItems.forEach((item) => {
      pdf.fontSize(11).text(item.description);
      pdf
        .fontSize(10)
        .fillColor("#555")
        .text(
          `Cantidad ${item.quantity} x ${item.unitPrice} EUR | IVA ${item.vatRate}% | IRPF ${item.irpfRate}% | Total ${item.lineTotal} EUR`,
        )
        .fillColor("#000");
      pdf.moveDown(0.4);
    });

    pdf.moveDown();
    pdf.fontSize(14).text("Totales", { underline: true });
    pdf.fontSize(11).text(`Base: ${invoice.subtotalAmount} EUR`);
    pdf.text(`IVA: ${invoice.vatAmount} EUR`);
    pdf.text(`IRPF: ${invoice.irpfAmount} EUR`);
    pdf.text(`Total: ${invoice.totalAmount} EUR`);
    pdf.text(`Cobrado: ${invoice.amountPaid} EUR`);
    pdf.text(`Pendiente: ${invoice.amountDue} EUR`);

    if (invoice.cancellationReason) {
      pdf.moveDown();
      pdf.fontSize(12).text(`Motivo de cancelacion: ${invoice.cancellationReason}`);
    }

    pdf.end();

    return new Promise((resolve, reject) => {
      pdf.on("end", () => resolve(Buffer.concat(chunks)));
      pdf.on("error", reject);
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

  private async findInvoice(organizationId: string, id: string): Promise<InvoiceWithItems> {
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

    return invoice as InvoiceWithItems;
  }

  private async findInvoiceWithTx(tx: any, id: string): Promise<InvoiceWithItems> {
    const invoice = await tx.query.invoices.findFirst({
      where: (table: any, operators: any) => operators.eq(table.id, id),
      with: {
        invoiceItems: {
          orderBy: [asc(invoiceItems.sortOrder)],
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException("Factura no encontrada");
    }

    return invoice as InvoiceWithItems;
  }
}

type InvoiceWithItems = typeof invoices.$inferSelect & {
  invoiceItems: Array<typeof invoiceItems.$inferSelect>;
};

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
