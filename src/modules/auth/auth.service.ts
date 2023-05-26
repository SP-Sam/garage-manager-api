import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { EmployeesService } from '../employees/employees.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private employeesService: EmployeesService,
    private jwtService: JwtService,
  ) {}

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
