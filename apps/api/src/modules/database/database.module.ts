import { Global, Module } from "@nestjs/common";
import { createDatabaseClient } from "@demo-facturator/database";
import { DATABASE_CLIENT } from "./database.constants";

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CLIENT,
      useFactory: () => createDatabaseClient(),
    },
  ],
  exports: [DATABASE_CLIENT],
})
export class DatabaseModule {}
