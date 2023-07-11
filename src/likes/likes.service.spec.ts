import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AutomapperModule } from "@automapper/nestjs";
import { classes } from "@automapper/classes";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesModule } from "../roles/roles.module";
import { UsersModule } from "../users/users.module";
import { PostsModule } from "../posts/posts.module";
import { LikesService } from "./likes.service";
import { Role } from "../roles/entities/role.entity";
import { User } from "../users/entities/user.entity";
import { Post } from "../posts/entities/post.entity";
import { Like } from "./entities/like.entity";
import { Pageable } from "../util/pagination/pagination.pageable";

describe("LikesService", () => {
  let service: LikesService;

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
        RolesModule,
        UsersModule,
        PostsModule],
      providers: [LikesService]
    }).compile();
    service = module.get<LikesService>(LikesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all likes with pagination", async () => {
      let pageable: Pageable<Like> = {
        page: 0,
        size: 10,
        sort: "id",
        order: "desc"
      };
      let [likes, total] = await service.findAll(pageable);
      expect(likes).toBeDefined();
      expect(total).toBeGreaterThanOrEqual(0);
      expect(likes.length).toBeLessThanOrEqual(pageable.size);
      expect(likes.length).toBeLessThanOrEqual(total);
    });

    it("should throw an InternalServerErrorException on error", async () => {
      let pageable: Pageable<Like> = {
        page: 0,
        size: 10,
        sort: "id",
        order: "desc"
      };
      jest.spyOn(service["likeRepository"], "findAndCount").mockRejectedValueOnce(new Error("Database connection failed"));
      await expect(service.findAll(pageable)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe("findByAuthor", () => {
    it("should return likes by post with pagination", async () => {
      let post = new Post();
      post.id = 1;
      let pageable: Pageable<Like> = {
        page: 0,
        size: 10,
        sort: "id",
        order: "desc"
      };
      jest.spyOn(service["postsService"], "findById").mockResolvedValueOnce(post);
      let [likes, total] = await service.findByPost(post.id, pageable);
      expect(likes).toBeDefined();
      expect(likes.length).toBeLessThanOrEqual(pageable.size);
      for (let like of likes) {
        expect(like.author.id).toBe(post.id);
      }
    });

    it("should throw a BadRequestException if author does not exist", async () => {
      let post = new Post();
      post.id = 1;
      let pageable: Pageable<Like> = {
        page: 0,
        size: 10,
        sort: "id",
        order: "desc"
      };
      jest.spyOn(service["postsService"], "findById").mockResolvedValueOnce(null);
      await expect(service.findByPost(post.id, pageable)).rejects.toThrow(BadRequestException);
    });
  });
});
