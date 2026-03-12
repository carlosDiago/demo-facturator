import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import type {
  ClientResponse,
  ClientsListResponse,
} from "@demo-facturator/shared";
import type { AuthenticatedRequest } from "../../common/auth-request";
import { CurrentAuth } from "../../common/current-auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { AuthService } from "../auth/auth.service";
import { ClientsService } from "./clients.service";

@Controller("clients")
@UseGuards(AuthGuard)
export class ClientsController {
  constructor(
    private readonly authService: AuthService,
    private readonly clientsService: ClientsService,
  ) {}

  @Get()
  async list(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Query("q") query?: string,
  ): Promise<ClientsListResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.clientsService.list(organization.id, query);
  }

  @Get(":id")
  async getById(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("id") id: string,
  ): Promise<ClientResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.clientsService.getById(organization.id, id);
  }

  @Post()
  async create(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Body() body: unknown,
  ): Promise<ClientResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.clientsService.create(organization.id, body);
  }

  @Put(":id")
  async update(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("id") id: string,
    @Body() body: unknown,
  ): Promise<ClientResponse> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    return this.clientsService.update(organization.id, id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  async archive(
    @CurrentAuth() auth: NonNullable<AuthenticatedRequest["auth"]>,
    @Param("id") id: string,
  ): Promise<void> {
    const organization = await this.authService.requireCurrentOrganization(auth.user.id);
    await this.clientsService.archive(organization.id, id);
  }
}
