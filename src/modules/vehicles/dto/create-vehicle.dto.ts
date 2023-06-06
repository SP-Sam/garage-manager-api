import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsNumber()
  @IsOptional()
  engine?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsNotEmpty()
  @IsNumber()
  customerId: number;
}
