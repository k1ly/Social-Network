import { Injectable } from "@nestjs/common";
import { MappingProfile, Mapper, createMap, forMember, mapFrom } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PostDto } from "./dto/post.dto";
import { Post } from "./entities/post.entity";

@Injectable()
export class PostsProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(mapper, Post, PostDto,
        forMember(postDto => postDto.author, mapFrom(post => post.author?.id)));
      createMap(mapper, CreatePostDto, Post);
      createMap(mapper, UpdatePostDto, Post);
    };
  }
}