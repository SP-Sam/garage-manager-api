import { PartialType } from '@nestjs/mapped-types';
import { RoleSlug } from '@prisma/client';
import { IsOptional } from 'class-validator';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';

export class UpdateEmployeeDto extends PartialType(RegisterDto) {
  @IsOptional()
  fullName?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  mobile?: string;

  @IsOptional()
  taxId?: string;

  @IsOptional()
  role?: RoleSlug;
}
