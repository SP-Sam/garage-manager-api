import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { RolesService } from '../roles/roles.service';

import * as bcrypt from 'bcrypt';
import { Employee, RoleSlug } from '@prisma/client';
import { SearchTypesEnum } from 'src/enum/searchType.enum';

@Injectable()
export class EmployeesService {
  constructor(
    private prismaService: PrismaService,
    private rolesService: RolesService,
  ) {}

  async create(data: RegisterDto, creatorId?: number) {
    const { id: roleId } = await this.rolesService.findUnique(data.role);

    delete data.role;

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltOrRounds);

    const employeeToCreate = {
      ...data,
      password: hashedPassword,
      employeeRole: { connect: { id: roleId } },
      creator: { connect: { id: creatorId } },
    };

    if (!creatorId) {
      delete employeeToCreate.creator;
    }

    const employee = await this.prismaService.employee.create({
      data: employeeToCreate as unknown as Employee,
    });

    return employee;
  }

  async findAll(page = 1, perPage = 10, employeeSub: number) {
    const skip = page * perPage - perPage;

    const { employeeRole } = await this.findUnique(employeeSub);

    if (employeeRole.slug === RoleSlug.MASTER) {
      return this.prismaService.employee.findMany({
        skip,
        take: perPage,
        orderBy: { id: 'asc' },
        include: { employeeRole: true },
      });
    } else {
      return this.prismaService.employee.findMany({
        where: { creatorId: employeeSub },
        skip,
        take: perPage,
        orderBy: { id: 'asc' },
        include: { employeeRole: true },
      });
    }
  }

  async findUnique(uniqueKey: string | number) {
    const key = typeof uniqueKey === 'number' ? 'id' : 'email';

    return this.prismaService.employee.findUniqueOrThrow({
      where: { [key]: uniqueKey },
      include: { employeeRole: true },
    });
  }

  async search(
    searchTerm: string,
    field: SearchTypesEnum,
    employeeSub: number,
  ) {
    const { employeeRole } = await this.findUnique(employeeSub);

    if (employeeRole.slug === RoleSlug.MASTER) {
      return this.prismaService.employee.findMany({
        where: { [field]: { contains: searchTerm, mode: 'insensitive' } },
      });
    } else {
      return this.prismaService.employee.findMany({
        where: {
          AND: [
            { creatorId: employeeSub },
            { [field]: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
      });
    }
  }

  async update(id: number, data: UpdateEmployeeDto, employeeSub: number) {
    const { employeeRole } = await this.findUnique(employeeSub);

    if (employeeRole.slug === RoleSlug.MASTER) {
      return this.prismaService.employee.update({ where: { id }, data });
    } else {
      const { creatorId } = await this.findUnique(id);

      if (creatorId === employeeSub) {
        return this.prismaService.employee.update({ where: { id }, data });
      } else {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'You are not the employee who registered this employee',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }

  async remove(id: number, employeeSub: number) {
    const { employeeRole } = await this.findUnique(employeeSub);

    if (employeeRole.slug === RoleSlug.MASTER) {
      return this.prismaService.employee.delete({ where: { id } });
    } else {
      const { creatorId } = await this.findUnique(id);

      if (creatorId === employeeSub) {
        return this.prismaService.employee.delete({ where: { id } });
      } else {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'You are not the employee who registered this employee',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }
}
