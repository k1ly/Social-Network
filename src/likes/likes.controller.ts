import {
  Controller, Get, Post, Body, Param, Delete, Query,
  ForbiddenException, NotFoundException
} from "@nestjs/common";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { ApiTags } from "@nestjs/swagger";
import { LikesService } from "./likes.service";
import { AbilityAction } from "../auth/ability/ability.action";
import { AbilityService } from "../auth/ability/ability.service";
import { Auth } from "../auth/auth.decorator";
import { UserDto } from "../users/dto/user.dto";
import { CreateLikeDto } from "./dto/create-like.dto";
import { LikeDto } from "./dto/like.dto";
import { Like } from "./entities/like.entity";
import { Pagination } from "../util/pagination/pagination.decorator";
import { Pageable } from "../util/pagination/pagination.pageable";

@ApiTags("likes")
@Controller("api/likes")
export class LikesController {
  constructor(@InjectMapper() private readonly mapper: Mapper,
              private readonly likesService: LikesService,
              private readonly abilityService: AbilityService) {
  }

  @Get()
  async findAll(@Query("post") post: number,
                @Pagination() pageable: Pageable<Like>,
                @Auth() auth: UserDto) {
    let [likes, total] = post ? await this.likesService.findByPost(post, pageable) : await this.likesService.findAll(pageable);
    if (likes.some(like => !this.abilityService.authorize(auth, AbilityAction.Read, like)))
      throw new ForbiddenException();
    return {
      content: this.mapper.mapArray(likes, Like, LikeDto),
      total: Math.ceil(total / pageable.size),
      pageable
    };
  }

  @Get(":id")
  async findById(@Param("id") id: number, @Auth() auth: UserDto) {
    let like = await this.likesService.findById(id);
    if (!like)
      throw new NotFoundException(`Like with id "${id}" doesn't exist!`);
    if (!this.abilityService.authorize(auth, AbilityAction.Read, like))
      throw new ForbiddenException();
    return this.mapper.map(like, Like, LikeDto);
  }

  @Post()
  async create(@Body() createLikeDto: CreateLikeDto, @Auth() auth: UserDto) {
    if (!this.abilityService.authorize(auth, AbilityAction.Create, Like))
      throw new ForbiddenException();
    createLikeDto.author = auth.id;
    await this.likesService.create(createLikeDto);
  }

  @Delete(":id")
  async remove(@Param("id") id: number, @Auth() auth: UserDto) {
    let like = await this.likesService.findById(id);
    if (!like)
      throw new NotFoundException(`Like with id "${id}" doesn't exist!`);
    if (!this.abilityService.authorize(auth, AbilityAction.Delete, like))
      throw new ForbiddenException();
    await this.likesService.remove(id);
  }
}
