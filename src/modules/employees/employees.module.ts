import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { PrismaService } from 'src/database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { RolesService } from '../roles/roles.service';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService, PrismaService, AuthService, RolesService],
})
export class EmployeesModule {}
