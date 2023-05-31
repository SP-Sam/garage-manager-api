import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from 'src/database/prisma.service';
import { EmployeesService } from '../employees/employees.service';
import { RoleSlug } from '@prisma/client';
import { SearchTypesEnum } from 'src/enum/searchType.enum';

@Injectable()
export class ServicesService {
  constructor(
    private prismaService: PrismaService,
    private employeesService: EmployeesService,
  ) {}

  async create(data: CreateServiceDto, employeeId: number) {
    return this.prismaService.service.create({
      data: { ...data, employeeId },
    });
  }

  async findAll(page = 1, perPage = 10, employeeId: number) {
    const skip = page * perPage - perPage;

    const { employeeRole } = await this.employeesService.findUnique(employeeId);

    if (
      employeeRole.slug !== RoleSlug.MASTER &&
      employeeRole.slug !== RoleSlug.MANAGER
    ) {
      return this.prismaService.service.findMany({
        where: { employeeId },
        skip,
        take: perPage,
        orderBy: { id: 'asc' },
        include: {
          customer: {
            select: { id: true, fullName: true, email: true, mobile: true },
          },
          employee: {
            select: { id: true, fullName: true, email: true, mobile: true },
          },
        },
      });
    }

    return this.prismaService.service.findMany({
      skip,
      take: perPage,
      orderBy: { id: 'asc' },
      include: {
        customer: {
          select: { id: true, fullName: true, email: true, mobile: true },
        },
        employee: {
          select: { id: true, fullName: true, email: true, mobile: true },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prismaService.service.findUniqueOrThrow({
      where: { id },
      include: {
        customer: {
          select: { id: true, fullName: true, email: true, mobile: true },
        },
        employee: {
          select: { id: true, fullName: true, email: true, mobile: true },
        },
      },
    });
  }

  async search(
    searchTerm: string | number,
    field: SearchTypesEnum,
    employeeId: number,
  ) {
    const { employeeRole } = await this.employeesService.findUnique(employeeId);

    if (
      employeeRole.slug !== RoleSlug.MASTER &&
      employeeRole.slug !== RoleSlug.MANAGER
    ) {
      return this.prismaService.service.findMany({
        where: {
          AND: [
            { employeeId },
            {
              OR: [
                { [field]: { contains: searchTerm, mode: 'insensitive' } },
                { [field]: searchTerm },
              ],
            },
          ],
        },
      });
    }

    return this.prismaService.service.findMany({
      where: { [field]: searchTerm },
    });
  }

  async update(id: number, data: UpdateServiceDto, employeeId: number) {
    const { employeeRole } = await this.employeesService.findUnique(employeeId);

    if (
      employeeRole.slug !== RoleSlug.MASTER &&
      employeeRole.slug !== RoleSlug.MANAGER
    ) {
      const employee = await this.employeesService.findUnique(employeeId);

      const service = await this.findOne(id);

      if (employee.id === service.employeeId) {
        return this.prismaService.service.update({ where: { id }, data });
      }

      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'You are not the employee who registered this service',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.prismaService.service.update({ where: { id }, data });
  }

  async remove(id: number, employeeId: number) {
    const { employeeRole } = await this.employeesService.findUnique(employeeId);

    if (
      employeeRole.slug !== RoleSlug.MASTER &&
      employeeRole.slug !== RoleSlug.MANAGER
    ) {
      const employee = await this.employeesService.findUnique(employeeId);

      const service = await this.findOne(id);

      if (employee.id === service.employeeId) {
        return this.prismaService.service.delete({ where: { id } });
      }

      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'You are not the employee who registered this service',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.prismaService.service.delete({ where: { id } });
  }
}
