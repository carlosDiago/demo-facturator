import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { AuthenticatedRequest } from "../../common/auth-request";
import { parseCookies } from "../../common/parse-cookie";
import { getAppConfig } from "../../config/app.config";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cookies = parseCookies(request.headers.cookie);
    const token = cookies[getAppConfig().sessionCookieName];

    if (!token) {
      throw new UnauthorizedException("Sesion requerida");
    }

    request.auth = await this.authService.getSessionContext(token);

    return true;
  }
}
