import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException
} from "@nestjs/common";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { compare, hash } from "bcrypt";
import { RolesService } from "../roles/roles.service";
import { UsersService } from "../users/users.service";
import { RolesNames } from "../roles/roles.names";
import { AuthDto } from "./dto/auth.dto";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { UserDto } from "../users/dto/user.dto";
import { User } from "../users/entities/user.entity";

export type Payload = { id: number };

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>,
              @InjectMapper() private readonly mapper: Mapper,
              private readonly usersService: UsersService,
              private readonly rolesService: RolesService) {
  }

  async register(createUserDto: CreateUserDto) {
    if (await this.usersService.findByLogin(createUserDto.login))
      throw new ConflictException("User with this login already exists");
    createUserDto.password = await hash(createUserDto.password, 10);
    let user = this.mapper.map(createUserDto, CreateUserDto, User);
    user.role = await this.rolesService.findByName(RolesNames.Client);
    if (!user.role)
      throw new BadRequestException(`Role with name "${RolesNames.Client}" doesn"t exist!`);
    try {
      return this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async authenticate(authDto: AuthDto) {
    let user = await this.usersService.findByLogin(authDto.login);
    if (!user)
      throw new UnauthorizedException("Invalid login or password");
    if (!await compare(authDto.password, user.password))
      throw new UnauthorizedException("Invalid login or password");
    return { id: user.id };
  }

  async createGuest() {
    let role = await this.rolesService.findByName(RolesNames.Guest);
    let guest = new UserDto();
    guest.role = role.name;
    return guest;
  }
}
