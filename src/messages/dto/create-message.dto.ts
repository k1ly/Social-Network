import { AutoMap } from "@automapper/classes";
import { IsEmpty, IsInt, IsNotEmpty, IsOptional, IsPositive, MaxLength } from "class-validator";

export class CreateMessageDto {
  @IsNotEmpty()
  @MaxLength(500)
  @AutoMap()
  text: string;

  @IsOptional()
  @IsEmpty()
  @AutoMap()
  fromUser: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @AutoMap()
  toUser: number;
}
