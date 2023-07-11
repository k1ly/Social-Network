import {
  Controller, Get, Post, Body, Param, Delete, Query,
  ForbiddenException, NotFoundException, Put, UploadedFiles, UseInterceptors
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { ApiTags } from "@nestjs/swagger";
import { PostsService } from "./posts.service";
import { AbilityAction } from "../auth/ability/ability.action";
import { AbilityService } from "../auth/ability/ability.service";
import { Auth } from "../auth/auth.decorator";
import { UserDto } from "../users/dto/user.dto";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PostDto } from "./dto/post.dto";
import { Post as PostEntity } from "./entities/post.entity";
import { Pagination } from "../util/pagination/pagination.decorator";
import { Pageable } from "../util/pagination/pagination.pageable";
import { join } from "path";

@ApiTags("posts")
@Controller("api/posts")
export class PostsController {
  constructor(@InjectMapper() private readonly mapper: Mapper,
              private readonly postsService: PostsService,
              private readonly abilityService: AbilityService) {
  }

  @Get()
  async findAll(@Query("author") author: number,
                @Pagination() pageable: Pageable<PostEntity>,
                @Auth() auth: UserDto) {
    let [posts, total] = author ? await this.postsService.findByAuthor(author, pageable) : await this.postsService.findAll(pageable);
    if (posts.some(post => !this.abilityService.authorize(auth, AbilityAction.Read, post)))
      throw new ForbiddenException();
    return {
      content: this.mapper.mapArray(posts, PostEntity, PostDto),
      total: Math.ceil(total / pageable.size),
      pageable
    };
  }

  @Get(":id")
  async findById(@Param("id") id: number, @Auth() auth: UserDto) {
    let post = await this.postsService.findById(id);
    if (!post)
      throw new NotFoundException(`Post with id "${id}" doesn't exist!`);
    if (!this.abilityService.authorize(auth, AbilityAction.Read, post))
      throw new ForbiddenException();
    return this.mapper.map(post, PostEntity, PostDto);
  }

  @Post("upload")
  @UseInterceptors(FilesInterceptor("image"))
  async upload(@UploadedFiles() files: Express.Multer.File, @Auth() auth: UserDto) {
    if (!this.abilityService.authorize(auth, AbilityAction.Create, PostEntity) || auth.blocked)
      throw new ForbiddenException();
    return join("posts", files[0].filename);
  }

  @Post()
  async create(@Body() createPostDto: CreatePostDto, @Auth() auth: UserDto) {
    if (!this.abilityService.authorize(auth, AbilityAction.Create, PostEntity) || auth.blocked)
      throw new ForbiddenException();
    createPostDto.author = auth.id;
    await this.postsService.create(createPostDto);
  }

  @Put(":id")
  async update(@Param("id") id: number, @Body() updatePostDto: UpdatePostDto, @Auth() auth: UserDto) {
    let post = await this.postsService.findById(id);
    if (!post)
      throw new NotFoundException(`Post with id "${id}" doesn't exist!`);
    if (!this.abilityService.authorize(auth, AbilityAction.Update, post))
      throw new ForbiddenException();
    await this.postsService.update(id, updatePostDto);
  }

  @Delete(":id")
  async remove(@Param("id") id: number, @Auth() auth: UserDto) {
    let post = await this.postsService.findById(id);
    if (!post)
      throw new NotFoundException(`Post with id "${id}" doesn't exist!`);
    if (!this.abilityService.authorize(auth, AbilityAction.Delete, post))
      throw new ForbiddenException();
    await this.postsService.remove(id);
  }
}
