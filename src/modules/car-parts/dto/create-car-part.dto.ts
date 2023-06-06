import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCarPartDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
