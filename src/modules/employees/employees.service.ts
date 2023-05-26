import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prismaService: PrismaService) {}

  async findAll(page = 1, perPage = 10) {
    const skip = page * perPage - perPage;

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

  async search(searchTerm: string) {
    return this.prismaService.employee.findMany({
      where: { fullName: { contains: searchTerm, mode: 'insensitive' } },
    });
  }

  async update(id: number, data: UpdateEmployeeDto) {
    return this.prismaService.employee.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prismaService.employee.delete({ where: { id } });
  }
}
