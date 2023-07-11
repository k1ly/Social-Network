import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { Auth } from "./auth.decorator";
import { TokenService } from "./token/token.service";
import { AuthDto } from "./dto/auth.dto";
import { UserDto } from "../users/dto/user.dto";
import { CreateUserDto } from "../users/dto/create-user.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService,
              private readonly tokenService: TokenService) {
  }

  @Post("login")
  async signIn(@Body() authDto: AuthDto) {
    let payload = await this.authService.authenticate(authDto);
    let token = this.tokenService.signToken(payload);
    await this.tokenService.saveToken(payload, token);
    return token;
  }

  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    await this.authService.register(createUserDto);
  }

  @Get("user")
  async getUser(@Auth() auth: UserDto) {
    return auth;
  }

  @Post("logout")
  async logout(@Auth() auth: UserDto) {
    let payload = { id: auth.id };
    if (payload.id)
      await this.tokenService.deleteToken(payload);
  }
}
