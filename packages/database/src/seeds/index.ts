import { randomBytes, scryptSync } from "node:crypto";
import { eq } from "drizzle-orm";
import { createDatabaseClient } from "../client";
import {
  clients,
  companyProfiles,
  invoiceSeries,
  organizationMembers,
  organizations,
  users,
} from "../schema";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${derivedKey}`;
}

async function seed() {
  const db = createDatabaseClient();

  const [user] = await db
    .insert(users)
    .values({
      email: "demo@facturator.local",
      passwordHash: hashPassword("changeme123"),
      fullName: "Carlos Demo",
    })
    .onConflictDoNothing()
    .returning();

  const targetUser =
    user ??
    (await db.query.users.findFirst({
      where: (table, operators) => operators.eq(table.email, "demo@facturator.local"),
    }));

  if (!targetUser) {
    throw new Error("No se ha podido resolver el usuario demo");
  }

  const [organization] = await db
    .insert(organizations)
    .values({
      slug: "demo-facturator",
      displayName: "Demo Facturator",
      ownerUserId: targetUser.id,
    })
    .onConflictDoNothing()
    .returning();

  const targetOrganization =
    organization ??
    (await db.query.organizations.findFirst({
      where: (table, operators) => operators.eq(table.slug, "demo-facturator"),
    }));

  if (!targetOrganization) {
    throw new Error("No se ha podido resolver la organizacion demo");
  }

  await db
    .insert(organizationMembers)
    .values({
      organizationId: targetOrganization.id,
      userId: targetUser.id,
      role: "owner",
      status: "active",
    })
    .onConflictDoNothing();

  const existingProfile = await db.query.companyProfiles.findFirst({
    where: (table, operators) =>
      operators.eq(table.organizationId, targetOrganization.id),
  });

  if (!existingProfile) {
    await db.insert(companyProfiles).values({
      organizationId: targetOrganization.id,
      personType: "self_employed",
      legalName: "Carlos Demo",
      tradeName: "Demo Facturator",
      taxId: "12345678Z",
      addressLine1: "Calle Mayor 1",
      postalCode: "28001",
      city: "Madrid",
      province: "Madrid",
      countryCode: "ES",
      defaultVatRate: "21.00",
      defaultIrpfRate: "15.00",
      paymentMessage: "Transferencia a 72 horas.",
      email: "facturas@facturator.local",
    });
  }

  const existingClient = await db.query.clients.findFirst({
    where: (table) => eq(table.organizationId, targetOrganization.id),
  });

  if (!existingClient) {
    await db.insert(clients).values({
      organizationId: targetOrganization.id,
      clientType: "company",
      legalName: "Cliente Demo SL",
      taxId: "B12345678",
      email: "admin@clientedemo.es",
      addressLine1: "Gran Via 123",
      postalCode: "28013",
      city: "Madrid",
      province: "Madrid",
      countryCode: "ES",
    });
  }

  const existingSeries = await db.query.invoiceSeries.findFirst({
    where: (table, operators) =>
      operators.and(
        operators.eq(table.organizationId, targetOrganization.id),
        operators.eq(table.code, "A"),
      ),
  });

  if (!existingSeries) {
    await db.insert(invoiceSeries).values({
      organizationId: targetOrganization.id,
      code: "A",
      name: "Serie general",
      prefix: "A",
      currentNumber: 0,
      isDefault: true,
      isActive: true,
    });
  }

  console.log("Seed inicial completado");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
