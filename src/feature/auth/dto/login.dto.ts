import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
