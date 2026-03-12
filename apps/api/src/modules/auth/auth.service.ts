import { Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import {
  organizationMembers,
  organizations,
  sessions,
  users,
  type DatabaseClient,
} from "@demo-facturator/database";
import type { AuthSessionResponse, OrganizationSummary } from "@demo-facturator/shared";
import { and, asc, eq } from "drizzle-orm";
import { getAppConfig } from "../../config/app.config";
import { DATABASE_CLIENT } from "../database/database.constants";
import {
  createSessionToken,
  hashSessionToken,
  verifyPassword,
} from "./auth.utils";

type SessionContext = {
  sessionId: string;
  user: AuthSessionResponse["user"];
  organization: OrganizationSummary | null;
};

@Injectable()
export class AuthService {
  constructor(@Inject(DATABASE_CLIENT) private readonly db: DatabaseClient) {}

  async login(email: string, password: string) {
    const user = await this.db.query.users.findFirst({
      where: (table, operators) => operators.eq(table.email, email.toLowerCase()),
    });

    if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException("Credenciales invalidas");
    }

    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + getAppConfig().sessionDurationDays);

    const [session] = await this.db
      .insert(sessions)
      .values({
        userId: user.id,
        tokenHash,
        expiresAt,
      })
      .returning({ id: sessions.id });

    await this.db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, user.id));

    const organization = await this.getCurrentOrganization(user.id);

    return {
      token,
      sessionId: session.id,
      payload: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        organization,
      } satisfies AuthSessionResponse,
    };
  }

  async logout(token: string) {
    await this.db.delete(sessions).where(eq(sessions.tokenHash, hashSessionToken(token)));
  }

  async getSessionContext(token: string): Promise<SessionContext> {
    const tokenHash = hashSessionToken(token);

    const session = await this.db.query.sessions.findFirst({
      where: (table, operators) =>
        operators.and(
          operators.eq(table.tokenHash, tokenHash),
          operators.gt(table.expiresAt, new Date()),
        ),
    });

    if (!session) {
      throw new UnauthorizedException("Sesion no valida");
    }

    const user = await this.db.query.users.findFirst({
      where: (table, operators) => operators.eq(table.id, session.userId),
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Usuario no disponible");
    }

    return {
      sessionId: session.id,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      organization: await this.getCurrentOrganization(user.id),
    };
  }

  async requireCurrentOrganization(userId: string) {
    const organization = await this.getCurrentOrganization(userId);

    if (!organization) {
      throw new NotFoundException("No hay organizacion activa para este usuario");
    }

    return organization;
  }

  private async getCurrentOrganization(userId: string): Promise<OrganizationSummary | null> {
    const rows = await this.db
      .select({
        id: organizations.id,
        slug: organizations.slug,
        displayName: organizations.displayName,
        role: organizationMembers.role,
      })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.status, "active"),
          eq(organizations.status, "active"),
        ),
      )
      .orderBy(asc(organizationMembers.createdAt))
      .limit(1);

    return rows[0] ?? null;
  }
}
