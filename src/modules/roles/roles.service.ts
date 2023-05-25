import { Injectable } from '@nestjs/common';
import { RoleSlug } from '@prisma/client';

import { PrismaService } from 'src/database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prismaService: PrismaService) {}

  async create(data: CreateRoleDto) {
    const role = await this.prismaService.employeeRole.create({
      data: data as unknown as CreateRoleDto,
    });

    return role;
  }

  async findAll() {
    return this.prismaService.employeeRole.findMany({ orderBy: { id: 'asc' } });
  }

  async findUnique(uniqueKey: RoleSlug | number) {
    const key = typeof uniqueKey === 'number' ? 'id' : 'slug';

    const role = await this.prismaService.employeeRole.findUniqueOrThrow({
      where: { [key]: uniqueKey },
    });

    return role;
  }

  async update(id: number, data: UpdateRoleDto) {
    return this.prismaService.employeeRole.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prismaService.employeeRole.delete({ where: { id } });
  }
}
