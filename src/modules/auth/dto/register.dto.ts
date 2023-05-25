import { RoleSlug } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 64)
  password: string;

  @IsNotEmpty()
  @IsString()
  @Length(11, 11)
  mobile: string;
  taxId: string;

  @IsNotEmpty()
  @IsEnum(RoleSlug)
  role: RoleSlug;

  @IsOptional()
  @IsString()
  address?: string;
  city?: string;
  state?: string;

  @IsOptional()
  @IsNumber()
  addressNumber?: number;
}
