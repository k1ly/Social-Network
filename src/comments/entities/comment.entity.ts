import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AutoMap } from "@automapper/classes";
import { User } from "../../users/entities/user.entity";
import { Post } from "../../posts/entities/post.entity";

@Entity({ name: "comments" })
export class Comment {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @AutoMap()
  @Column()
  text: string;

  @AutoMap()
  @Column()
  date: Date;

  @AutoMap()
  @ManyToOne(() => User)
  @JoinColumn({ name: "authorId", referencedColumnName: "id" })
  author: User;

  @AutoMap()
  @ManyToOne(() => Post)
  @JoinColumn({ name: "postId", referencedColumnName: "id" })
  post: Post;
}
