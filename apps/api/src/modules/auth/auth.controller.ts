import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { loginSchema, type AuthSessionResponse } from "@demo-facturator/shared";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../../common/auth-request";
import { CurrentAuth } from "../../common/current-auth.decorator";
import { parseCookies } from "../../common/parse-cookie";
import { getAppConfig } from "../../config/app.config";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponse> {
    const input = loginSchema.parse(body);
    const result = await this.authService.login(input.email, input.password);

    this.writeSessionCookie(response, result.token);

    return result.payload;
  }

  @Post("logout")
  @HttpCode(204)
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookies = parseCookies(request.headers.cookie);
    const token = cookies[getAppConfig().sessionCookieName];

    if (token) {
      await this.authService.logout(token);
    }

    this.clearSessionCookie(response);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@CurrentAuth() auth: AuthenticatedRequest["auth"]): AuthSessionResponse {
    return {
      user: auth!.user,
      organization: auth!.organization,
    };
  }

  private writeSessionCookie(response: Response, token: string) {
    const { sessionCookieName, sessionDurationDays } = getAppConfig();
    const maxAge = sessionDurationDays * 24 * 60 * 60;
    response.setHeader(
      "Set-Cookie",
      `${sessionCookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
    );
  }

  private clearSessionCookie(response: Response) {
    response.setHeader(
      "Set-Cookie",
      `${getAppConfig().sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    );
  }
}
