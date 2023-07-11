import { AutoMap } from "@automapper/classes";

export class LikeDto {
  @AutoMap()
  id: number;

  @AutoMap()
  author: number;

  @AutoMap()
  post: number;
}
