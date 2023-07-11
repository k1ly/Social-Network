import { AutoMap } from "@automapper/classes";

export class MessageDto {
  @AutoMap()
  id: number;

  @AutoMap()
  text: string;

  @AutoMap()
  date: Date;

  @AutoMap()
  fromUser: number;

  @AutoMap()
  toUser: number;
}
