import { Controller, Get } from "@nestjs/common";
import type { ApiHealthResponse } from "@demo-facturator/shared";

@Controller()
export class AppController {
  @Get("health")
  getHealth(): ApiHealthResponse {
    return {
      service: "demo-facturator-api",
      status: "ok",
    };
  }
}
