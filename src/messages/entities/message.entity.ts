import { AutoMap } from "@automapper/classes";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity({ name: "messages" })
export class Message {
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
  @JoinColumn({ name: "fromUserId", referencedColumnName: "id" })
  fromUser: User;

  @AutoMap()
  @ManyToOne(() => User)
  @JoinColumn({ name: "toUserId", referencedColumnName: "id" })
  toUser: User;
}
