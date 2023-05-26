import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { RolesService } from '../roles/roles.service';
import { CustomerController } from './customer.controller';
import { EmployeesService } from '../employees/employees.service';
import { CustomersService } from './customer.service';

@Module({
  controllers: [CustomerController],
  providers: [
    PrismaService,
    AuthService,
    RolesService,
    EmployeesService,
    CustomersService,
  ],
})
export class CustomersModule {}
