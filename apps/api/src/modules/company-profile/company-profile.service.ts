import { Inject, Injectable } from "@nestjs/common";
import { companyProfiles, type DatabaseClient } from "@demo-facturator/database";
import { companyProfileSchema, type CompanyProfileResponse } from "@demo-facturator/shared";
import { eq } from "drizzle-orm";
import { DATABASE_CLIENT } from "../database/database.constants";

@Injectable()
export class CompanyProfileService {
  constructor(@Inject(DATABASE_CLIENT) private readonly db: DatabaseClient) {}

  async getCurrent(organizationId: string): Promise<CompanyProfileResponse> {
    const profile = await this.db.query.companyProfiles.findFirst({
      where: (table, operators) => operators.eq(table.organizationId, organizationId),
    });

    return {
      profile: profile
        ? {
            id: profile.id,
            organizationId: profile.organizationId,
            personType: profile.personType,
            legalName: profile.legalName,
            tradeName: profile.tradeName,
            taxId: profile.taxId,
            addressLine1: profile.addressLine1,
            addressLine2: profile.addressLine2,
            postalCode: profile.postalCode,
            city: profile.city,
            province: profile.province,
            countryCode: profile.countryCode,
            defaultVatRate: profile.defaultVatRate,
            defaultIrpfRate: profile.defaultIrpfRate,
            paymentMessage: profile.paymentMessage,
            iban: profile.iban,
            email: profile.email,
            phone: profile.phone,
          }
        : null,
    };
  }

  async upsert(organizationId: string, body: unknown): Promise<CompanyProfileResponse> {
    const input = companyProfileSchema.parse(body);
    const existing = await this.db.query.companyProfiles.findFirst({
      where: (table, operators) => operators.eq(table.organizationId, organizationId),
    });

    if (!existing) {
      const [created] = await this.db
        .insert(companyProfiles)
        .values({
          organizationId,
          personType: input.personType,
          legalName: input.legalName,
          tradeName: input.tradeName ?? null,
          taxId: input.taxId,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2 ?? null,
          postalCode: input.postalCode,
          city: input.city,
          province: input.province,
          countryCode: input.countryCode,
          defaultVatRate: input.defaultVatRate.toFixed(2),
          defaultIrpfRate: input.defaultIrpfRate.toFixed(2),
          paymentMessage: input.paymentMessage ?? null,
          iban: input.iban ?? null,
          email: input.email ?? null,
          phone: input.phone ?? null,
        })
        .returning();

      return this.getCurrent(created.organizationId);
    }

    await this.db
      .update(companyProfiles)
      .set({
        personType: input.personType,
        legalName: input.legalName,
        tradeName: input.tradeName ?? null,
        taxId: input.taxId,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 ?? null,
        postalCode: input.postalCode,
        city: input.city,
        province: input.province,
        countryCode: input.countryCode,
        defaultVatRate: input.defaultVatRate.toFixed(2),
        defaultIrpfRate: input.defaultIrpfRate.toFixed(2),
        paymentMessage: input.paymentMessage ?? null,
        iban: input.iban ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        updatedAt: new Date(),
      })
      .where(eq(companyProfiles.id, existing.id));

    return this.getCurrent(organizationId);
  }
}
