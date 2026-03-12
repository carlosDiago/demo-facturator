import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { InvoiceSeriesController } from "./invoice-series.controller";
import { InvoiceSeriesService } from "./invoice-series.service";

@Module({
  imports: [AuthModule],
  controllers: [InvoiceSeriesController],
  providers: [InvoiceSeriesService],
})
export class InvoiceSeriesModule {}
