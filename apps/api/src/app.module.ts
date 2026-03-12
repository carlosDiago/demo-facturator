import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { CompanyProfileModule } from "./modules/company-profile/company-profile.module";
import { DatabaseModule } from "./modules/database/database.module";
import { InvoiceSeriesModule } from "./modules/invoice-series/invoice-series.module";
import { InvoicesModule } from "./modules/invoices/invoices.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    OrganizationsModule,
    CompanyProfileModule,
    ClientsModule,
    InvoiceSeriesModule,
    InvoicesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
