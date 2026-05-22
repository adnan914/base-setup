import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class PayloadDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ext: string[];
}
