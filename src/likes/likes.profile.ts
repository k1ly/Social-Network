import { Injectable } from "@nestjs/common";
import { MappingProfile, Mapper, createMap, forMember, mapFrom } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { CreateLikeDto } from "./dto/create-like.dto";
import { Like } from "./entities/like.entity";
import { LikeDto } from "./dto/like.dto";

@Injectable()
export class LikesProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(mapper, Like, LikeDto,
        forMember(likeDto => likeDto.author, mapFrom(like => like.author?.id)),
        forMember(likeDto => likeDto.post, mapFrom(like => like.post?.id)));
      createMap(mapper, CreateLikeDto, Like);
    };
  }
}