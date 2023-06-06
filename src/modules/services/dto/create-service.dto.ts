import { ServiceStatusEnum } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  totalCost: number;

  @IsOptional()
  @IsEnum(ServiceStatusEnum)
  status?: ServiceStatusEnum;

  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @IsNotEmpty()
  @IsNumber()
  vehicleId: number;

  carParts: { id: number; price: number; quantity: number }[];
}
