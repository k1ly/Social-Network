import { AutoMap } from "@automapper/classes";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity({ name: "posts" })
export class Post {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @AutoMap()
  @Column()
  text: string;

  @AutoMap()
  @Column()
  imageUrl: string;

  @AutoMap()
  @Column()
  date: Date;

  @AutoMap()
  @ManyToOne(() => User)
  @JoinColumn({ name: "authorId", referencedColumnName: "id" })
  author: User;
}
