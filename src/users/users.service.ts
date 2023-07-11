import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { RolesService } from "../roles/roles.service";
import { RolesNames } from "../roles/roles.names";
import { BlockUserDto } from "./dto/block-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { Pageable } from "../util/pagination/pagination.pageable";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>,
              @InjectMapper() private readonly mapper: Mapper,
              private readonly rolesService: RolesService) {
  }

  async findAll(pageable: Pageable<User>) {
    try {
      return await this.usersRepository.findAndCount({
          relations: { role: true },
          skip: pageable.page * pageable.size,
          take: pageable.size,
          order: { [pageable.sort]: pageable.order }
        }
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByFilter(filter: string, pageable: Pageable<User>) {
    try {
      return await this.usersRepository.findAndCount({
        relations: { role: true },
        where: { login: Like(`%${filter}%`) },
        skip: pageable.page * pageable.size,
        take: pageable.size,
        order: { [pageable.sort]: pageable.order }
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findById(id: number) {
    try {
      return await this.usersRepository.findOne({
        relations: { role: true },
        where: { id }
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByLogin(login: string) {
    try {
      return await this.usersRepository.findOne({
        relations: { role: true },
        where: { login }
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(createUserDto: CreateUserDto) {
    let user = this.mapper.map(createUserDto, CreateUserDto, User);
    user.role = await this.rolesService.findByName(RolesNames.Guest);
    if (!user.role)
      throw new BadRequestException(`Role with name "${RolesNames.Guest}" doesn"t exist!`);
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    let user = this.mapper.map(updateUserDto, UpdateUserDto, User);
    try {
      return await this.usersRepository.update(id, user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async block(id: number, blockUserDto: BlockUserDto) {
    let user = this.mapper.map(blockUserDto, BlockUserDto, User);
    try {
      return await this.usersRepository.update(id, user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: number) {
    try {
      return await this.usersRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
