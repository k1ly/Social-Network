import { Test, TestingModule } from "@nestjs/testing";
import { ForbiddenException } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Mapper } from "@automapper/core";
import { AutomapperModule, getMapperToken } from "@automapper/nestjs";
import { classes } from "@automapper/classes";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { RolesModule } from "../roles/roles.module";
import { UsersModule } from "../users/users.module";
import { PostsModule } from "../posts/posts.module";
import { AbilityService } from "../auth/ability/ability.service";
import { LikesService } from "./likes.service";
import { LikesController } from "./likes.controller";
import { LikesProfile } from "./likes.profile";
import { RolesNames } from "../roles/roles.names";
import { Role } from "../roles/entities/role.entity";
import { User } from "../users/entities/user.entity";
import { Post } from "../posts/entities/post.entity";
import { Like } from "./entities/like.entity";
import { UserDto } from "../users/dto/user.dto";
import { LikeDto } from "./dto/like.dto";
import { Pageable } from "../util/pagination/pagination.pageable";

describe("LikesController", () => {
  let controller: LikesController;
  let likesService: LikesService;
  let abilityService: AbilityService;
  let mapper: Mapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule.forRoot()],
          inject: [ConfigService],
          useFactory: configService => ({
            type: configService.get("DB_TYPE"),
            host: configService.get("DB_HOST"),
            port: Number(configService.get("DB_PORT")),
            username: configService.get("DB_USERNAME"),
            password: configService.get("DB_PASSWORD"),
            database: configService.get("DB_DATABASE"),
            autoLoadEntities: true,
            extra: { trustServerCertificate: true }
          })
        }),
        TypeOrmModule.forFeature([Role, User, Post, Like]),
        AutomapperModule.forRoot({
          strategyInitializer: classes()
        }),
        AuthModule,
        RolesModule,
        UsersModule,
        PostsModule],
      controllers: [LikesController],
      providers: [LikesService, LikesProfile]
    }).compile();

    controller = module.get<LikesController>(LikesController);
    likesService = module.get<LikesService>(LikesService);
    abilityService = module.get<AbilityService>(AbilityService);
    mapper = module.get<Mapper>(getMapperToken());
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated likes data when no post is provided", async () => {
      let post = 0;
      let pageable: Pageable<Like> = {
        page: 0,
        size: 10,
        sort: "id",
        order: "desc"
      };
      let auth = new UserDto();
      auth.role = RolesNames.Admin;
      let [likes, total] = await likesService.findAll(pageable);
      jest.spyOn(abilityService, "authorize").mockReturnValue(true);
      let expectedResponse = {
        content: mapper.mapArray(likes, Like, LikeDto),
        total: Math.ceil(total / pageable.size),
        pageable
      };
      let result = await controller.findAll(post, pageable, auth);
      expect(result).toEqual(expectedResponse);
    });

    it("should return paginated likes data when post is provided", async () => {
      let post = 1;
      let pageable: Pageable<Like> = {
        page: 0,
        size: 10,
        sort: "id",
        order: "desc"
      };
      let auth = new UserDto();
      auth.role = RolesNames.Admin;
      let [likes, total] = await likesService.findByPost(post, pageable);
      jest.spyOn(abilityService, "authorize").mockReturnValue(true);
      let expectedResponse = {
        content: mapper.mapArray(likes, Like, LikeDto),
        total: Math.ceil(total / pageable.size),
        pageable
      };
      let result = await controller.findAll(post, pageable, auth);
      expect(result).toEqual(expectedResponse);
    });

    it("should throw a ForbiddenException if likes authorization fails", async () => {
      let post = 0;
      let pageable: Pageable<Like> = {
        page: 0,
        size: 10,
        sort: "id",
        order: "desc"
      };
      let auth = new UserDto();
      auth.role = RolesNames.Guest;
      let [likes] = await likesService.findAll(pageable);
      jest.spyOn(abilityService, "authorize").mockReturnValue(false);
      if (likes.length > 0)
        await expect(controller.findAll(post, pageable, auth)).rejects.toThrow(ForbiddenException);
    });
  });
});
