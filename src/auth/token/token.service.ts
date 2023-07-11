import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { RedisService } from "@liaoliaots/nestjs-redis";
import { Payload } from "../auth.service";

@Injectable()
export class TokenService {
  constructor(private readonly redisService: RedisService,
              private readonly jwtService: JwtService,
              private readonly configService: ConfigService) {
  }

  signToken(payload: Payload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_SECRET"),
      expiresIn: Number(this.configService.get("JWT_EXPIRATION"))
    });
  }

  validateToken(token: string) {
    try {
      let { exp, iat, ...payload } = this.jwtService.verify(
        token, {
          secret: this.configService.get("JWT_SECRET")
        }
      );
      return (<Payload>payload);
    } catch (error) {
      throw new UnauthorizedException(`Invalid token: ${error.message}`);
    }
  }

  async saveToken(payload: Payload, token: string) {
    return this.redisService.getClient().set(`${payload.id}`, token,
      "EX", Number(this.configService.get("JWT_EXPIRATION")));
  }

  async deleteToken(payload: Payload) {
    return this.redisService.getClient().del(`${payload.id}`);
  }

  async verifyToken(payload: Payload) {
    if (!this.redisService.getClient().get(`${payload.id}`))
      throw new UnauthorizedException("Token expired!");
  }
}