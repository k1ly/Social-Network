import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { AutoMap } from "@automapper/classes";
import { Role } from "../../roles/entities/role.entity";

@Entity({ name: "users" })
export class User {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @AutoMap()
  @Column()
  login: string;

  @AutoMap()
  @Column()
  password: string;

  @AutoMap()
  @Column()
  name: string;

  @AutoMap()
  @Column()
  email: string;

  @AutoMap()
  @Column()
  blocked: boolean;

  @AutoMap()
  @ManyToOne(() => Role)
  @JoinColumn({ name: "roleId", referencedColumnName: "id" })
  role: Role;
}