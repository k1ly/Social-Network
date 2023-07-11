import { Injectable } from "@nestjs/common";
import { MappingProfile, Mapper, createMap, forMember, mapFrom } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { BlockUserDto } from "./dto/block-user.dto";
import { UserDto } from "./dto/user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(mapper, User, UserDto,
        forMember(userDto => userDto.role, mapFrom(user => user.role?.name)));
      createMap(mapper, CreateUserDto, User);
      createMap(mapper, UpdateUserDto, User);
      createMap(mapper, BlockUserDto, User);
    };
  }
}