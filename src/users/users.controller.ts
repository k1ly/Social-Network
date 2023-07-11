import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, Put, Query } from "@nestjs/common";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "../auth/auth.decorator";
import { AbilityAction } from "../auth/ability/ability.action";
import { AbilityService } from "../auth/ability/ability.service";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { BlockUserDto } from "./dto/block-user.dto";
import { UserDto } from "./dto/user.dto";
import { User } from "./entities/user.entity";
import { Pagination } from "../util/pagination/pagination.decorator";
import { Pageable } from "../util/pagination/pagination.pageable";

@ApiTags("users")
@Controller("api/users")
export class UsersController {
  constructor(@InjectMapper() private readonly mapper: Mapper,
              private readonly usersService: UsersService,
              private readonly abilityService: AbilityService) {
  }

  @Get()
  async findAll(@Query("filter") filter: string,
                @Pagination() pageable: Pageable<User>,
                @Auth() auth: UserDto) {
    let [users, total] = filter ? await this.usersService.findByFilter(filter, pageable) : await this.usersService.findAll(pageable);
    if (users.some(user => !this.abilityService.authorize(auth, AbilityAction.Read, user)))
      throw new ForbiddenException();
    return {
      content: this.mapper.mapArray(users, User, UserDto),
      total: Math.ceil(total / pageable.size),
      pageable
    };
  }

  @Get(":id")
  async findById(@Param("id") id: number, @Auth() auth: UserDto) {
    let user = await this.usersService.findById(id);
    if (!user)
      throw new NotFoundException(`User with id "${id}" doesn"t exist!`);
    if (!this.abilityService.authorize(auth, AbilityAction.Read, user))
      throw new ForbiddenException();
    return this.mapper.map(user, User, UserDto);
  }

  @Put(":id")
  async update(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto, @Auth() auth: UserDto) {
    let user = await this.usersService.findById(id);
    if (!user)
      throw new NotFoundException(`User with id "${id}" doesn"t exist!`);
    if (!this.abilityService.authorize(auth, AbilityAction.Create, user))
      throw new ForbiddenException();
    await this.usersService.update(id, updateUserDto);
  }

  @Put(":id/block")
  async updateByAdmin(@Param("id") id: number, @Body() blockUserDto: BlockUserDto, @Auth() auth: UserDto) {
    let user = await this.usersService.findById(id);
    if (!user)
      throw new NotFoundException(`User with id "${id}" doesn"t exist!`);
    if (!this.abilityService.authorize(auth, AbilityAction.Update, user))
      throw new ForbiddenException();
    await this.usersService.block(id, blockUserDto);
  }
}
