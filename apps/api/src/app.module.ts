import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { CompanyProfileModule } from "./modules/company-profile/company-profile.module";
import { DatabaseModule } from "./modules/database/database.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";

@Module({
  imports: [DatabaseModule, AuthModule, OrganizationsModule, CompanyProfileModule],
  controllers: [AppController],
})
export class AppModule {}
