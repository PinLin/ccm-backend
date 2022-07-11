import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetMessagesDto {
  @Type(() => Number)
  @IsInt()
  @Max(50)
  @Min(1)
  @IsOptional()
  take?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  skip?: number;

  /**
   * @deprecated This field has been replaced by `take`.
   */
   @Type(() => Number)
   @IsInt()
   @Max(50)
   @Min(1)
   @IsOptional()
   count?: number;
}
