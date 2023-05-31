import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { CustomersModule } from './modules/customers/customer.module';
import { ServicesModule } from './modules/services/services.module';
import { CarPartsModule } from './modules/car-parts/car-parts.module';

@Module({
  imports: [
    AuthModule,
    RolesModule,
    EmployeesModule,
    CustomersModule,
    ServicesModule,
    CarPartsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
