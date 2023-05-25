import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/database/prisma.service';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';
import { EmployeesService } from '../employees/employees.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private rolesService: RolesService,
    private employeesService: EmployeesService,
    private jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const { id: roleId } = await this.rolesService.findUnique(data.role);

    delete data.role;

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltOrRounds);

    const employeeToCreate = {
      ...data,
      password: hashedPassword,
      employeeRole: { connect: { id: roleId } },
    };

    const employee = await this.prismaService.employee.create({
      data: employeeToCreate,
    });

    return employee;
  }

  async login(data: LoginDto) {
    const { email, password } = data;

    const employee = await this.employeesService.findUnique(email);
    if (!employee) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Employee email not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'Incorrect password',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const jwtPayload = {
      sub: employee.id,
      email: employee.email,
      fullName: employee.fullName,
      role: employee.employeeRole.slug,
    };

    return {
      access_token: await this.jwtService.signAsync(jwtPayload),
    };
  }
}
