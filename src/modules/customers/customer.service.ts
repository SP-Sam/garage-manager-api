import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { EmployeesService } from '../employees/employees.service';
import { RoleSlug } from '@prisma/client';
import { SearchTypesEnum } from 'src/enum/searchType.enum';

@Injectable()
export class CustomersService {
  constructor(
    private prismaService: PrismaService,
    private employeesService: EmployeesService,
  ) {}

  async create(data: CreateCustomerDto, employeeId: number) {
    const customer = await this.prismaService.customer.create({
      data: { ...data, employee: { connect: { id: employeeId } } },
    });

    return customer;
  }

  async findAll(page = 1, perPage = 10, employeeSub: number) {
    const skip = page * perPage - perPage;

    const { employeeRole } = await this.employeesService.findUnique(
      employeeSub,
    );

    if (employeeRole.slug === RoleSlug.MASTER) {
      return this.prismaService.customer.findMany({
        skip,
        take: perPage,
        orderBy: { id: 'asc' },
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              employeeRole: { select: { id: true, slug: true } },
            },
          },
        },
      });
    } else {
      return this.prismaService.customer.findMany({
        where: { employeeId: employeeSub },
        skip,
        take: perPage,
        orderBy: { id: 'asc' },
        include: { employee: true },
      });
    }
  }

  async findUnique(uniqueKey: string | number) {
    const key = typeof uniqueKey === 'number' ? 'id' : 'email';

    return this.prismaService.customer.findUniqueOrThrow({
      where: { [key]: uniqueKey },
      include: { employee: true },
    });
  }

  async search(
    searchTerm: string,
    field: SearchTypesEnum,
    employeeSub: number,
  ) {
    const { employeeRole } = await this.employeesService.findUnique(
      employeeSub,
    );

    if (employeeRole.slug === RoleSlug.MASTER) {
      return this.prismaService.customer.findMany({
        where: { [field]: { contains: searchTerm, mode: 'insensitive' } },
      });
    } else {
      return this.prismaService.customer.findMany({
        where: {
          AND: [
            { employeeId: employeeSub },
            { [field]: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
      });
    }
  }

  async update(id: number, data: UpdateCustomerDto, employeeSub: number) {
    const { employeeRole } = await this.employeesService.findUnique(
      employeeSub,
    );

    if (employeeRole.slug === RoleSlug.MASTER) {
      return this.prismaService.customer.update({ where: { id }, data });
    } else {
      const { employeeId } =
        await this.prismaService.customer.findUniqueOrThrow({
          where: { id },
          include: { employee: true },
        });

      if (employeeId === employeeSub) {
        return this.prismaService.customer.update({ where: { id }, data });
      } else {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'You are not the employee who registered this customer',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }

  async delete(id: number, employeeSub: number) {
    const { employeeRole } = await this.employeesService.findUnique(
      employeeSub,
    );

    if (employeeRole.slug === RoleSlug.MASTER) {
      return this.prismaService.customer.delete({ where: { id } });
    } else {
      const { employeeId } =
        await this.prismaService.customer.findUniqueOrThrow({
          where: { id },
          include: { employee: true },
        });

      if (employeeId === employeeSub) {
        return this.prismaService.customer.delete({ where: { id } });
      } else {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'You are not the employee who registered this customer',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }
}
