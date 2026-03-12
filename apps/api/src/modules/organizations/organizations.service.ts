import { Inject, Injectable } from "@nestjs/common";
import { organizationMembers, organizations, type DatabaseClient } from "@demo-facturator/database";
import { organizationSchema, type CurrentOrganizationResponse } from "@demo-facturator/shared";
import { DATABASE_CLIENT } from "../database/database.constants";

@Injectable()
export class OrganizationsService {
  constructor(@Inject(DATABASE_CLIENT) private readonly db: DatabaseClient) {}

  async createForUser(userId: string, body: unknown): Promise<CurrentOrganizationResponse> {
    const input = organizationSchema.parse(body);

    const [organization] = await this.db
      .insert(organizations)
      .values({
        displayName: input.displayName,
        slug: input.slug,
        ownerUserId: userId,
      })
      .returning({
        id: organizations.id,
        slug: organizations.slug,
        displayName: organizations.displayName,
      });

    await this.db.insert(organizationMembers).values({
      organizationId: organization.id,
      userId,
      role: "owner",
      status: "active",
    });

    return {
      organization: {
        ...organization,
        role: "owner",
      },
    };
  }

  async getCurrent(userId: string): Promise<CurrentOrganizationResponse | null> {
    const row = await this.db.query.organizationMembers.findFirst({
      where: (table, operators) =>
        operators.and(
          operators.eq(table.userId, userId),
          operators.eq(table.status, "active"),
        ),
    });

    if (!row) {
      return null;
    }

    const organization = await this.db.query.organizations.findFirst({
      where: (table, operators) => operators.eq(table.id, row.organizationId),
    });

    if (!organization) {
      return null;
    }

    return {
      organization: {
        id: organization.id,
        slug: organization.slug,
        displayName: organization.displayName,
        role: row.role,
      },
    };
  }
}
