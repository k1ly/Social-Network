import { AutoMap } from "@automapper/classes";

export class PostDto {
  @AutoMap()
  id: number;

  @AutoMap()
  text: string;

  @AutoMap()
  imageUrl: string;

  @AutoMap()
  date: Date;

  @AutoMap()
  author: number;
}
