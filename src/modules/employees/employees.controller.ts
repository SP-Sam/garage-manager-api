import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { Response } from 'express';
import { Prisma, RoleSlug } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly authService: AuthService,
  ) {}

  @Roles(RoleSlug.MASTER, RoleSlug.MANAGER)
  @Post()
  async create(@Body() body: RegisterDto, @Res() response: Response) {
    try {
      const employee = await this.authService.register(body);

      return response.status(HttpStatus.CREATED).json(employee);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            // Remove todos os "\n" para exibir uma mensagem de erro mais legível
            error: e.message.replace(/(\r\n|\n|\r)/gm, ''),
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(RoleSlug.MASTER, RoleSlug.MANAGER)
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('perPage') perPage = '10',
    @Res() response: Response,
  ) {
    try {
      const employees = await this.employeesService.findAll(+page, +perPage);

      return response.status(HttpStatus.OK).json(employees);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(RoleSlug.MASTER, RoleSlug.MANAGER)
  @Get('search')
  async search(@Query('q') q: string, @Res() response: Response) {
    try {
      const search = await this.employeesService.search(q);

      return response.status(HttpStatus.OK).json(search);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: e.meta.cause,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(RoleSlug.MASTER, RoleSlug.MANAGER)
  @Get(':id')
  async findById(@Param('id') id: string, @Res() response: Response) {
    try {
      const employee = await this.employeesService.findUnique(+id);

      return response.status(HttpStatus.OK).json(employee);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            // Remove todos os "\n" para exibir uma mensagem de erro mais legível
            error: e.message.replace(/(\r\n|\n|\r)/gm, ''),
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(RoleSlug.MASTER, RoleSlug.MANAGER)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateEmployeeDto,
    @Res() response: Response,
  ) {
    try {
      await this.employeesService.update(+id, body);

      return response.status(HttpStatus.NO_CONTENT).end();
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: e.meta.cause,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(RoleSlug.MASTER, RoleSlug.MANAGER)
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() response: Response) {
    try {
      await this.employeesService.delete(+id);

      return response.status(HttpStatus.NO_CONTENT).end();
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: e.meta.cause,
          },
          HttpStatus.BAD_REQUEST,
          {
            cause: e,
          },
        );
      }

      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
