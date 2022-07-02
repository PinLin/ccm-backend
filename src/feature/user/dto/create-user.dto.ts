import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(8964)
  @MinLength(8)
  secret: string;
}
