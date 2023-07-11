import {
  Controller,
  Get,
  Query,
  NotFoundException
} from "@nestjs/common";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { ApiTags } from "@nestjs/swagger";
import { RolesService } from "./roles.service";
import { RoleDto } from "./dto/role.dto";
import { Role } from "./entities/role.entity";

@ApiTags("roles")
@Controller("api/roles")
export class RolesController {
  constructor(@InjectMapper() private readonly mapper: Mapper,
              private readonly rolesService: RolesService) {
  }

  @Get()
  async findAll() {
    let roles = await this.rolesService.findAll();
    return this.mapper.mapArray(roles, Role, RoleDto);
  }

  @Get("find")
  async findByName(@Query("name") name: string) {
    let role = await this.rolesService.findByName(name);
    if (!role)
      throw new NotFoundException(`Role with name "${name}" doesn"t exist!`);
    return this.mapper.map(role, Role, RoleDto);
  }
}
