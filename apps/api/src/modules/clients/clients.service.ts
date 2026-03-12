import {
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { clients, type DatabaseClient } from "@demo-facturator/database";
import {
  clientSchema,
  type ClientResponse,
  type ClientsListResponse,
} from "@demo-facturator/shared";
import { and, eq, ilike, or } from "drizzle-orm";
import { DATABASE_CLIENT } from "../database/database.constants";

@Injectable()
export class ClientsService {
  constructor(@Inject(DATABASE_CLIENT) private readonly db: DatabaseClient) {}

  async list(organizationId: string, query?: string): Promise<ClientsListResponse> {
    const whereClause = query
      ? and(
          eq(clients.organizationId, organizationId),
          or(
            ilike(clients.legalName, `%${query}%`),
            ilike(clients.taxId, `%${query}%`),
          ),
        )
      : eq(clients.organizationId, organizationId);

    const rows = await this.db.query.clients.findMany({
      where: whereClause,
      orderBy: (table, operators) => [operators.asc(table.legalName)],
    });

    return {
      clients: rows.map(mapClient),
    };
  }

  async getById(organizationId: string, id: string): Promise<ClientResponse> {
    const client = await this.db.query.clients.findFirst({
      where: (table, operators) =>
        operators.and(
          operators.eq(table.id, id),
          operators.eq(table.organizationId, organizationId),
        ),
    });

    if (!client) {
      throw new NotFoundException("Cliente no encontrado");
    }

    return { client: mapClient(client) };
  }

  async create(organizationId: string, body: unknown): Promise<ClientResponse> {
    const input = clientSchema.parse(body);

    const [created] = await this.db
      .insert(clients)
      .values({
        organizationId,
        clientType: input.clientType,
        legalName: input.legalName,
        taxId: input.taxId ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 ?? null,
        postalCode: input.postalCode,
        city: input.city,
        province: input.province,
        countryCode: input.countryCode,
        notes: input.notes ?? null,
      })
      .returning();

    return { client: mapClient(created) };
  }

  async update(organizationId: string, id: string, body: unknown): Promise<ClientResponse> {
    const input = clientSchema.parse(body);
    await this.assertBelongsToOrganization(organizationId, id);

    const [updated] = await this.db
      .update(clients)
      .set({
        clientType: input.clientType,
        legalName: input.legalName,
        taxId: input.taxId ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 ?? null,
        postalCode: input.postalCode,
        city: input.city,
        province: input.province,
        countryCode: input.countryCode,
        notes: input.notes ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(clients.id, id), eq(clients.organizationId, organizationId)))
      .returning();

    return { client: mapClient(updated) };
  }

  async archive(organizationId: string, id: string): Promise<void> {
    await this.assertBelongsToOrganization(organizationId, id);

    await this.db
      .update(clients)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(eq(clients.id, id), eq(clients.organizationId, organizationId)));
  }

  private async assertBelongsToOrganization(organizationId: string, id: string) {
    const client = await this.db.query.clients.findFirst({
      where: (table, operators) =>
        operators.and(
          operators.eq(table.id, id),
          operators.eq(table.organizationId, organizationId),
        ),
    });

    if (!client) {
      throw new NotFoundException("Cliente no encontrado");
    }

    return client;
  }
}

function mapClient(client: typeof clients.$inferSelect) {
  return {
    id: client.id,
    organizationId: client.organizationId,
    clientType: client.clientType,
    legalName: client.legalName,
    taxId: client.taxId,
    email: client.email,
    phone: client.phone,
    addressLine1: client.addressLine1,
    addressLine2: client.addressLine2,
    postalCode: client.postalCode,
    city: client.city,
    province: client.province,
    countryCode: client.countryCode,
    notes: client.notes,
    isActive: client.isActive,
  };
}
