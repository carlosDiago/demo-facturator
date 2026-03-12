import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { invoiceSeries, type DatabaseClient } from "@demo-facturator/database";
import {
  invoiceSeriesSchema,
  type InvoiceSeriesListResponse,
  type InvoiceSeriesResponse,
} from "@demo-facturator/shared";
import { and, eq } from "drizzle-orm";
import { DATABASE_CLIENT } from "../database/database.constants";

@Injectable()
export class InvoiceSeriesService {
  constructor(@Inject(DATABASE_CLIENT) private readonly db: DatabaseClient) {}

  async list(organizationId: string): Promise<InvoiceSeriesListResponse> {
    const rows = await this.db.query.invoiceSeries.findMany({
      where: (table, operators) => operators.eq(table.organizationId, organizationId),
      orderBy: (table, operators) => [operators.desc(table.isDefault), operators.asc(table.code)],
    });

    return {
      series: rows.map(mapSeries),
    };
  }

  async getById(organizationId: string, id: string): Promise<InvoiceSeriesResponse> {
    const series = await this.findOne(organizationId, id);
    return { series: mapSeries(series) };
  }

  async create(organizationId: string, body: unknown): Promise<InvoiceSeriesResponse> {
    const input = invoiceSeriesSchema.parse(body);

    await this.assertUniqueCode(organizationId, input.code);

    return this.db.transaction(async (tx) => {
      if (input.isDefault) {
        await tx
          .update(invoiceSeries)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(invoiceSeries.organizationId, organizationId));
      }

      const [created] = await tx
        .insert(invoiceSeries)
        .values({
          organizationId,
          code: input.code,
          name: input.name,
          prefix: input.prefix ?? null,
          isDefault: input.isDefault,
          isActive: input.isActive,
        })
        .returning();

      return { series: mapSeries(created) };
    });
  }

  async update(organizationId: string, id: string, body: unknown): Promise<InvoiceSeriesResponse> {
    const existing = await this.findOne(organizationId, id);
    const input = invoiceSeriesSchema.parse(body);

    if (existing.code !== input.code) {
      await this.assertUniqueCode(organizationId, input.code);
    }

    return this.db.transaction(async (tx) => {
      if (input.isDefault) {
        await tx
          .update(invoiceSeries)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(invoiceSeries.organizationId, organizationId));
      }

      const [updated] = await tx
        .update(invoiceSeries)
        .set({
          code: input.code,
          name: input.name,
          prefix: input.prefix ?? null,
          isDefault: input.isDefault,
          isActive: input.isActive,
          updatedAt: new Date(),
        })
        .where(and(eq(invoiceSeries.id, id), eq(invoiceSeries.organizationId, organizationId)))
        .returning();

      return { series: mapSeries(updated) };
    });
  }

  async setDefault(organizationId: string, id: string): Promise<InvoiceSeriesResponse> {
    await this.findOne(organizationId, id);

    return this.db.transaction(async (tx) => {
      await tx
        .update(invoiceSeries)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(invoiceSeries.organizationId, organizationId));

      const [updated] = await tx
        .update(invoiceSeries)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(and(eq(invoiceSeries.id, id), eq(invoiceSeries.organizationId, organizationId)))
        .returning();

      return { series: mapSeries(updated) };
    });
  }

  private async findOne(organizationId: string, id: string) {
    const series = await this.db.query.invoiceSeries.findFirst({
      where: (table, operators) =>
        operators.and(
          operators.eq(table.id, id),
          operators.eq(table.organizationId, organizationId),
        ),
    });

    if (!series) {
      throw new NotFoundException("Serie no encontrada");
    }

    return series;
  }

  private async assertUniqueCode(organizationId: string, code: string) {
    const existing = await this.db.query.invoiceSeries.findFirst({
      where: (table, operators) =>
        operators.and(
          operators.eq(table.organizationId, organizationId),
          operators.eq(table.code, code),
        ),
    });

    if (existing) {
      throw new ConflictException("Ya existe una serie con ese codigo");
    }
  }
}

function mapSeries(series: typeof invoiceSeries.$inferSelect) {
  return {
    id: series.id,
    organizationId: series.organizationId,
    code: series.code,
    name: series.name,
    prefix: series.prefix,
    currentNumber: series.currentNumber,
    isDefault: series.isDefault,
    isActive: series.isActive,
  };
}
