import { AutoMap } from "@automapper/classes";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Post } from "../../posts/entities/post.entity";

@Entity({ name: "likes" })
export class Like {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @AutoMap()
  @ManyToOne(() => User)
  @JoinColumn({ name: "authorId", referencedColumnName: "id" })
  author: User;

  @AutoMap()
  @ManyToOne(() => Post)
  @JoinColumn({ name: "postId", referencedColumnName: "id" })
  post: Post;
}
