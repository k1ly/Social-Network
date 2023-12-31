import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { AuthService } from "./auth.service";
import { TokenService } from "./token/token.service";
import { UsersService } from "../users/users.service";
import { UserDto } from "../users/dto/user.dto";
import { User } from "../users/entities/user.entity";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@InjectMapper() private readonly mapper: Mapper,
              private readonly authService: AuthService,
              private readonly tokenService: TokenService,
              private readonly usersService: UsersService) {
  }

  async canActivate(context: ExecutionContext) {
    let request = context.switchToHttp().getRequest();
    let [type, token] = request.headers.authorization?.split(" ") ?? [];
    if (!(token = type === "Bearer" ? token : undefined)) {
      request.user = await this.authService.createGuest();
      return true;
    }
    let payload = this.tokenService.validateToken(token);
    await this.tokenService.verifyToken(payload);
    let user = await this.usersService.findById(payload.id);
    if (!user)
      throw new UnauthorizedException("Invalid token!");
    request.user = this.mapper.map(user, User, UserDto);
    return true;
  }
}