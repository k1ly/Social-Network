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
import { AbilityService } from "../auth/ability/ability.service";
import { PostsService } from "./posts.service";
import { PostsController } from "./posts.controller";
import { PostsProfile } from "./posts.profile";
import { RolesNames } from "../roles/roles.names";
import { Role } from "../roles/entities/role.entity";
import { User } from "../users/entities/user.entity";
import { Post } from "./entities/post.entity";
import { UserDto } from "../users/dto/user.dto";
import { PostDto } from "./dto/post.dto";
import { Pageable } from "../util/pagination/pagination.pageable";

describe("PostsController", () => {
  let controller: PostsController;
  let postsService: PostsService;
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
        TypeOrmModule.forFeature([Role, User, Post]),
        AutomapperModule.forRoot({
          strategyInitializer: classes()
        }),
        AuthModule,
        RolesModule,
        UsersModule],
      controllers: [PostsController],
      providers: [PostsService, PostsProfile]
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
    abilityService = module.get<AbilityService>(AbilityService);
    mapper = module.get<Mapper>(getMapperToken());
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated posts data when no author is provided", async () => {
      let author = 0;
      let pageable: Pageable<Post> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      let auth = new UserDto();
      auth.role = RolesNames.Admin;
      let [posts, total] = await postsService.findAll(pageable);
      jest.spyOn(abilityService, "authorize").mockReturnValue(true);
      let expectedResponse = {
        content: mapper.mapArray(posts, Post, PostDto),
        total: Math.ceil(total / pageable.size),
        pageable
      };
      let result = await controller.findAll(author, pageable, auth);
      expect(result).toEqual(expectedResponse);
    });

    it("should return paginated posts data when author is provided", async () => {
      let author = 1;
      let pageable: Pageable<Post> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      let auth = new UserDto();
      auth.role = RolesNames.Admin;
      let [posts, total] = await postsService.findByAuthor(author, pageable);
      jest.spyOn(abilityService, "authorize").mockReturnValue(true);
      let expectedResponse = {
        content: mapper.mapArray(posts, Post, PostDto),
        total: Math.ceil(total / pageable.size),
        pageable
      };
      let result = await controller.findAll(author, pageable, auth);
      expect(result).toEqual(expectedResponse);
    });

    it("should throw a ForbiddenException if posts authorization fails", async () => {
      let author = 0;
      let pageable: Pageable<Post> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      let auth = new UserDto();
      auth.role = RolesNames.Guest;
      let [users] = await postsService.findAll(pageable);
      jest.spyOn(abilityService, "authorize").mockReturnValue(false);
      if (users.length > 0)
        await expect(controller.findAll(author, pageable, auth)).rejects.toThrow(ForbiddenException);
    });
  });
});
