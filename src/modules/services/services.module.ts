import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { PrismaService } from 'src/database/prisma.service';
import { EmployeesService } from '../employees/employees.service';
import { RolesService } from '../roles/roles.service';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService, PrismaService, EmployeesService, RolesService],
})
export class ServicesModule {}
