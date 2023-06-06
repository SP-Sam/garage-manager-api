import { PartialType } from '@nestjs/mapped-types';
import { CreateCarPartDto } from './create-car-part.dto';
import { IsOptional } from 'class-validator';

export class UpdateCarPartDto extends PartialType(CreateCarPartDto) {
  @IsOptional()
  name?: string;

  @IsOptional()
  price?: number;
}
