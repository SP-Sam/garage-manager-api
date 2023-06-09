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
    const lowercaseEmail = data.email.toLowerCase();

    const customer = await this.prismaService.customer.create({
      data: {
        ...data,
        email: lowercaseEmail,
        employee: { connect: { id: employeeId } },
      },
    });

    return customer;
  }

  async findAll(page = 1, perPage = 10, employeeSub: number) {
    const skip = page * perPage - perPage;

    const { employeeRole } = await this.employeesService.findUnique(
      employeeSub,
    );

    if (employeeRole.slug !== RoleSlug.MASTER) {
      return this.prismaService.customer.findMany({
        where: { employeeId: employeeSub },
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
    }

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
  }

  async findUnique(uniqueKey: string | number) {
    const key = typeof uniqueKey === 'number' ? 'id' : 'email';

    return this.prismaService.customer.findUniqueOrThrow({
      where: { [key]: uniqueKey },
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
  }

  async search(
    searchTerm: string,
    field: SearchTypesEnum,
    employeeSub: number,
  ) {
    const { employeeRole } = await this.employeesService.findUnique(
      employeeSub,
    );

    if (employeeRole.slug !== RoleSlug.MASTER) {
      return this.prismaService.customer.findMany({
        where: {
          AND: [
            { employeeId: employeeSub },
            { [field]: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
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
    }

    return this.prismaService.customer.findMany({
      where: { [field]: { contains: searchTerm, mode: 'insensitive' } },
    });
  }

  async update(id: number, data: UpdateCustomerDto, employeeSub: number) {
    const { employeeRole } = await this.employeesService.findUnique(
      employeeSub,
    );

    if (employeeRole.slug !== RoleSlug.MASTER) {
      const { employeeId } = await this.findUnique(id);

      if (employeeId === employeeSub) {
        return this.prismaService.customer.update({ where: { id }, data });
      }

      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'You are not the employee who registered this customer',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.prismaService.customer.update({ where: { id }, data });
  }

  async remove(id: number, employeeSub: number) {
    const { employeeRole } = await this.employeesService.findUnique(
      employeeSub,
    );

    if (employeeRole.slug === RoleSlug.MASTER) {
      return this.prismaService.customer.delete({ where: { id } });
    } else {
      const { employeeId } = await this.findUnique(id);

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
