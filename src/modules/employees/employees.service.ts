import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prismaService: PrismaService) {}

  async findUnique(uniqueKey: string | number) {
    const key = typeof uniqueKey === 'number' ? 'id' : 'email';

    return this.prismaService.employee.findUnique({
      where: { [key]: uniqueKey },
      include: { employeeRole: true },
    });
  }
}
