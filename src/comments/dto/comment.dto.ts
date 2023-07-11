import { AutoMap } from "@automapper/classes";

export class CommentDto {
  id: number;

  @AutoMap()
  text: string;

  @AutoMap()
  date: Date;

  @AutoMap()
  author: number;

  @AutoMap()
  post: number;
}
