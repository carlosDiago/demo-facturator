import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const organizationStatusEnum = pgEnum("organization_status", [
  "active",
  "inactive",
]);

export const organizationMemberRoleEnum = pgEnum("organization_member_role", [
  "owner",
  "admin",
  "member",
]);

export const organizationMemberStatusEnum = pgEnum(
  "organization_member_status",
  ["active", "invited", "disabled"],
);

export const personTypeEnum = pgEnum("person_type", [
  "self_employed",
  "company",
]);

export const clientTypeEnum = pgEnum("client_type", ["individual", "company"]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "issued",
  "partially_paid",
  "paid",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "bank_transfer",
  "cash",
  "card",
  "bizum",
  "other",
]);

export const attachmentKindEnum = pgEnum("attachment_kind", [
  "logo",
  "invoice_pdf",
  "attachment",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [uniqueIndex("users_email_unique_idx").on(table.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("sessions_token_hash_unique_idx").on(table.tokenHash)],
);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: organizationStatusEnum("status").notNull().default("active"),
    ...timestamps,
  },
  (table) => [uniqueIndex("organizations_slug_unique_idx").on(table.slug)],
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: organizationMemberRoleEnum("role").notNull().default("member"),
    status: organizationMemberStatusEnum("status").notNull().default("active"),
    invitedByUserId: uuid("invited_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("organization_members_org_user_unique_idx").on(
      table.organizationId,
      table.userId,
    ),
  ],
);

export const companyProfiles = pgTable(
  "company_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    personType: personTypeEnum("person_type").notNull(),
    legalName: varchar("legal_name", { length: 255 }).notNull(),
    tradeName: varchar("trade_name", { length: 255 }),
    taxId: varchar("tax_id", { length: 32 }).notNull(),
    addressLine1: varchar("address_line_1", { length: 255 }).notNull(),
    addressLine2: varchar("address_line_2", { length: 255 }),
    postalCode: varchar("postal_code", { length: 16 }).notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    province: varchar("province", { length: 120 }).notNull(),
    countryCode: varchar("country_code", { length: 2 }).notNull().default("ES"),
    defaultVatRate: numeric("default_vat_rate", {
      precision: 5,
      scale: 2,
    })
      .notNull()
      .default("21.00"),
    defaultIrpfRate: numeric("default_irpf_rate", {
      precision: 5,
      scale: 2,
    })
      .notNull()
      .default("0.00"),
    paymentMessage: text("payment_message"),
    iban: varchar("iban", { length: 34 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 32 }),
    logoAttachmentId: uuid("logo_attachment_id"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("company_profiles_organization_unique_idx").on(table.organizationId),
  ],
);

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  clientType: clientTypeEnum("client_type").notNull().default("company"),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  taxId: varchar("tax_id", { length: 32 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 32 }),
  addressLine1: varchar("address_line_1", { length: 255 }).notNull(),
  addressLine2: varchar("address_line_2", { length: 255 }),
  postalCode: varchar("postal_code", { length: 16 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  province: varchar("province", { length: 120 }).notNull(),
  countryCode: varchar("country_code", { length: 2 }).notNull().default("ES"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const invoiceSeries = pgTable(
  "invoice_series",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 40 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    prefix: varchar("prefix", { length: 40 }),
    currentNumber: integer("current_number").notNull().default(0),
    isDefault: boolean("is_default").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("invoice_series_org_code_unique_idx").on(
      table.organizationId,
      table.code,
    ),
  ],
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    seriesId: uuid("series_id")
      .notNull()
      .references(() => invoiceSeries.id, { onDelete: "restrict" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    number: integer("number"),
    fullNumber: varchar("full_number", { length: 80 }),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date"),
    status: invoiceStatusEnum("status").notNull().default("draft"),
    currencyCode: varchar("currency_code", { length: 3 }).notNull().default("EUR"),
    notes: text("notes"),
    paymentTerms: text("payment_terms"),
    subtotalAmount: numeric("subtotal_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    vatAmount: numeric("vat_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    irpfAmount: numeric("irpf_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    amountPaid: numeric("amount_paid", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    amountDue: numeric("amount_due", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    updatedByUserId: uuid("updated_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    issuedByUserId: uuid("issued_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    cancelledByUserId: uuid("cancelled_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    issuerLegalName: varchar("issuer_legal_name", { length: 255 }),
    issuerTaxId: varchar("issuer_tax_id", { length: 32 }),
    issuerAddressLine1: varchar("issuer_address_line_1", { length: 255 }),
    issuerPostalCode: varchar("issuer_postal_code", { length: 16 }),
    issuerCity: varchar("issuer_city", { length: 120 }),
    issuerProvince: varchar("issuer_province", { length: 120 }),
    issuerCountryCode: varchar("issuer_country_code", { length: 2 }),
    clientLegalName: varchar("client_legal_name", { length: 255 }),
    clientTaxId: varchar("client_tax_id", { length: 32 }),
    clientAddressLine1: varchar("client_address_line_1", { length: 255 }),
    clientPostalCode: varchar("client_postal_code", { length: 16 }),
    clientCity: varchar("client_city", { length: 120 }),
    clientProvince: varchar("client_province", { length: 120 }),
    clientCountryCode: varchar("client_country_code", { length: 2 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("invoices_org_series_number_unique_idx").on(
      table.organizationId,
      table.seriesId,
      table.number,
    ),
  ],
);

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull().default("1.00"),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  discountRate: numeric("discount_rate", { precision: 5, scale: 2 })
    .notNull()
    .default("0.00"),
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).notNull().default("21.00"),
  irpfRate: numeric("irpf_rate", { precision: 5, scale: 2 })
    .notNull()
    .default("0.00"),
  lineSubtotal: numeric("line_subtotal", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  lineVatAmount: numeric("line_vat_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  lineIrpfAmount: numeric("line_irpf_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "restrict" }),
  paymentDate: date("payment_date").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull().default("bank_transfer"),
  reference: varchar("reference", { length: 120 }),
  notes: text("notes"),
  createdByUserId: uuid("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const attachments = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  storageProvider: varchar("storage_provider", { length: 60 }).notNull(),
  storageKey: varchar("storage_key", { length: 255 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  kind: attachmentKindEnum("kind").notNull().default("attachment"),
  uploadedByUserId: uuid("uploaded_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  actorUserId: uuid("actor_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  action: varchar("action", { length: 120 }).notNull(),
  metadataJson: jsonb("metadata_json").notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const invoicesRelations = relations(invoices, ({ many, one }) => ({
  items: many(invoiceItems),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  series: one(invoiceSeries, {
    fields: [invoices.seriesId],
    references: [invoiceSeries.id],
  }),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const schema = {
  organizationStatusEnum,
  organizationMemberRoleEnum,
  organizationMemberStatusEnum,
  personTypeEnum,
  clientTypeEnum,
  invoiceStatusEnum,
  paymentMethodEnum,
  attachmentKindEnum,
  users,
  sessions,
  organizations,
  organizationMembers,
  companyProfiles,
  clients,
  invoiceSeries,
  invoices,
  invoiceItems,
  payments,
  attachments,
  auditLogs,
};
