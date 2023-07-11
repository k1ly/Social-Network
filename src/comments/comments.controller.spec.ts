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
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { CommentsProfile } from "./comments.profile";
import { RolesNames } from "../roles/roles.names";
import { Role } from "../roles/entities/role.entity";
import { User } from "../users/entities/user.entity";
import { Post } from "../posts/entities/post.entity";
import { Comment } from "./entities/comment.entity";
import { UserDto } from "../users/dto/user.dto";
import { CommentDto } from "./dto/comment.dto";
import { Pageable } from "../util/pagination/pagination.pageable";

describe("CommentsController", () => {
  let controller: CommentsController;
  let commentsService: CommentsService;
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
        TypeOrmModule.forFeature([Role, User, Post, Comment]),
        AutomapperModule.forRoot({
          strategyInitializer: classes()
        }),
        AuthModule,
        RolesModule,
        UsersModule,
        PostsModule],
      controllers: [CommentsController],
      providers: [CommentsService, CommentsProfile]
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    commentsService = module.get<CommentsService>(CommentsService);
    abilityService = module.get<AbilityService>(AbilityService);
    mapper = module.get<Mapper>(getMapperToken());
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated comments data when no post is provided", async () => {
      let post = 0;
      let pageable: Pageable<Comment> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      let auth = new UserDto();
      auth.role = RolesNames.Admin;
      let [comments, total] = await commentsService.findAll(pageable);
      jest.spyOn(abilityService, "authorize").mockReturnValue(true);
      let expectedResponse = {
        content: mapper.mapArray(comments, Comment, CommentDto),
        total: Math.ceil(total / pageable.size),
        pageable
      };
      let result = await controller.findAll(post, pageable, auth);
      expect(result).toEqual(expectedResponse);
    });

    it("should return paginated comments data when post is provided", async () => {
      let post = 1;
      let pageable: Pageable<Comment> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      let auth = new UserDto();
      auth.role = RolesNames.Admin;
      let [comments, total] = await commentsService.findByPost(post, pageable);
      jest.spyOn(abilityService, "authorize").mockReturnValue(true);
      let expectedResponse = {
        content: mapper.mapArray(comments, Comment, CommentDto),
        total: Math.ceil(total / pageable.size),
        pageable
      };
      let result = await controller.findAll(post, pageable, auth);
      expect(result).toEqual(expectedResponse);
    });

    it("should throw a ForbiddenException if comments authorization fails", async () => {
      let post = 0;
      let pageable: Pageable<Comment> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      let auth = new UserDto();
      auth.role = RolesNames.Guest;
      let [users] = await commentsService.findAll(pageable);
      jest.spyOn(abilityService, "authorize").mockReturnValue(false);
      if (users.length > 0)
        await expect(controller.findAll(post, pageable, auth)).rejects.toThrow(ForbiddenException);
    });
  });
});
