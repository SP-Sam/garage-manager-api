import { SetMetadata } from '@nestjs/common';
import { RoleSlug } from '@prisma/client';

export const Roles = (...roles: RoleSlug[]) => SetMetadata('roles', roles);
