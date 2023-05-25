import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import { IsOptional } from 'class-validator';
import { RoleSlug } from '@prisma/client';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsOptional()
  name?: string;
  slug?: RoleSlug;
}
