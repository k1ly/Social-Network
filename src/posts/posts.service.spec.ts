import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AutomapperModule } from "@automapper/nestjs";
import { classes } from "@automapper/classes";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesModule } from "../roles/roles.module";
import { UsersModule } from "../users/users.module";
import { PostsService } from "./posts.service";
import { Role } from "../roles/entities/role.entity";
import { User } from "../users/entities/user.entity";
import { Post } from "./entities/post.entity";
import { Pageable } from "../util/pagination/pagination.pageable";

describe("PostsService", () => {
  let service: PostsService;

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
        RolesModule,
        UsersModule],
      providers: [PostsService]
    }).compile();
    service = module.get<PostsService>(PostsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all posts with pagination", async () => {
      let pageable: Pageable<Post> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      let [posts, total] = await service.findAll(pageable);
      expect(posts).toBeDefined();
      expect(total).toBeGreaterThanOrEqual(0);
      expect(posts.length).toBeLessThanOrEqual(pageable.size);
      expect(posts.length).toBeLessThanOrEqual(total);
    });

    it("should throw an InternalServerErrorException on error", async () => {
      let pageable: Pageable<Post> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      jest.spyOn(service["postRepository"], "findAndCount").mockRejectedValueOnce(new Error("Database connection failed"));
      await expect(service.findAll(pageable)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe("findByAuthor", () => {
    it("should return posts by author with pagination", async () => {
      let author = new User();
      author.id = 1;
      let pageable: Pageable<Post> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      jest.spyOn(service["usersService"], "findById").mockResolvedValueOnce(author);
      let [posts, total] = await service.findByAuthor(author.id, pageable);
      expect(posts).toBeDefined();
      expect(posts.length).toBeLessThanOrEqual(pageable.size);
      for (let post of posts) {
        expect(post.author.id).toBe(author.id);
      }
    });

    it("should throw a BadRequestException if author does not exist", async () => {
      let author = new User();
      author.id = 1;
      let pageable: Pageable<Post> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      jest.spyOn(service["usersService"], "findById").mockResolvedValueOnce(null);
      await expect(service.findByAuthor(author.id, pageable)).rejects.toThrow(BadRequestException);
    });
  });
});
