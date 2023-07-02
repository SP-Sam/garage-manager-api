import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { RolesService } from '../roles/roles.service';

import * as bcrypt from 'bcrypt';
import { Employee, RoleSlug } from '@prisma/client';
import { SearchTypesEnum } from 'src/enum/searchType.enum';
import { async } from 'rxjs';

@Injectable()
export class EmployeesService {
  constructor(
    private prismaService: PrismaService,
    private rolesService: RolesService,
  ) {}

  async create(data: RegisterDto, creatorId?: number) {
    const lowerCaseEmail = data.email.toLocaleLowerCase();

    const foundedEmployeeEmail = await this.prismaService.employee.findFirst({
      where: { email: lowerCaseEmail },
    });

    if (foundedEmployeeEmail) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'E-mail already registered',
        },
        HttpStatus.CONFLICT,
      );
    }

    const foundedEmployeeTaxId = await this.prismaService.employee.findFirst({
      where: { taxId: lowerCaseEmail },
    });

    if (foundedEmployeeTaxId) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'Tax ID already registered',
        },
        HttpStatus.CONFLICT,
      );
    }

    const employeeFormatted = {
      ...data,
      email: lowerCaseEmail,
    };

    if (data.role === 'MASTER') {
      const masterEmployee = await this.prismaService.employee.findFirst({
        where: { roleId: 1 },
      });

      if (masterEmployee) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'A Master user already exists',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    const { id: roleId } = await this.rolesService.findUnique(data.role);

    delete employeeFormatted.role;

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltOrRounds);

    const employeeToCreate = {
      ...employeeFormatted,
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

    if (employeeRole.slug !== RoleSlug.MASTER) {
      return this.prismaService.employee.findMany({
        where: { creatorId: employeeSub },
        skip,
        take: perPage,
        orderBy: { id: 'asc' },
        include: { employeeRole: true },
      });
    }

    return this.prismaService.employee.findMany({
      skip,
      take: perPage,
      orderBy: { id: 'asc' },
      include: { employeeRole: true },
    });
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

    if (employeeRole.slug !== RoleSlug.MASTER) {
      return this.prismaService.employee.findMany({
        where: {
          AND: [
            { creatorId: employeeSub },
            { [field]: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
      });
    }

    return this.prismaService.employee.findMany({
      where: { [field]: { contains: searchTerm, mode: 'insensitive' } },
    });
  }

  async update(id: number, data: UpdateEmployeeDto, employeeSub: number) {
    const { employeeRole } = await this.findUnique(employeeSub);

    if (employeeRole.slug !== RoleSlug.MASTER) {
      const { creatorId } = await this.findUnique(id);

      if (creatorId === employeeSub) {
        return this.prismaService.employee.update({ where: { id }, data });
      }

      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'You are not the employee who registered this employee',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.prismaService.employee.update({ where: { id }, data });
  }

  async remove(id: number, employeeSub: number) {
    const { employeeRole } = await this.findUnique(employeeSub);

    if (employeeRole.slug !== RoleSlug.MASTER) {
      const { creatorId } = await this.findUnique(id);

      if (creatorId === employeeSub) {
        return this.prismaService.employee.delete({ where: { id } });
      }

      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'You are not the employee who registered this employee',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.prismaService.employee.delete({ where: { id } });
  }
}
