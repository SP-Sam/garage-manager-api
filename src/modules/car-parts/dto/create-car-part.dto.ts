import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCarPartDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
