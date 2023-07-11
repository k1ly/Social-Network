import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PostsService } from "../posts/posts.service";
import { CreateLikeDto } from "./dto/create-like.dto";
import { Like } from "./entities/like.entity";
import { Pageable } from "../util/pagination/pagination.pageable";
import { UsersService } from "../users/users.service";

@Injectable()
export class LikesService {
  constructor(@InjectRepository(Like) private readonly likeRepository: Repository<Like>,
              @InjectMapper() private readonly mapper: Mapper,
              private readonly usersService: UsersService,
              private readonly postsService: PostsService) {
  }

  async findAll(pageable: Pageable<Like>) {
    try {
      return await this.likeRepository.findAndCount({
          relations: { author: true, post: true },
          skip: pageable.page * pageable.size,
          take: pageable.size,
          order: { [pageable.sort]: pageable.order }
        }
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByPost(postId: number, pageable: Pageable<Like>) {
    let post = await this.postsService.findById(postId);
    if (!post)
      throw new BadRequestException(`Post with id "${postId}" doesn't exist!`);
    try {
      return await this.likeRepository.findAndCount({
          relations: { author: true, post: true },
          where: { post },
          skip: pageable.page * pageable.size,
          take: pageable.size,
          order: { [pageable.sort]: pageable.order }
        }
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findById(id: number) {
    try {
      return await this.likeRepository.findOne({
        relations: { author: true, post: true },
        where: { id }
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(createLikeDto: CreateLikeDto) {
    let like = this.mapper.map(createLikeDto, CreateLikeDto, Like);
    like.author = await this.usersService.findById(createLikeDto.author);
    if (!like.author)
      throw new BadRequestException(`User with id "${createLikeDto.author}" doesn't exist!`);
    like.post = await this.postsService.findById(createLikeDto.post);
    if (!like.post)
      throw new BadRequestException(`Post with id "${createLikeDto.post}" doesn't exist!`);
    try {
      return await this.likeRepository.save(like);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: number) {
    try {
      return await this.likeRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
