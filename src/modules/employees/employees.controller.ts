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
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { Response } from 'express';
import { Prisma, RoleSlug } from '@prisma/client';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { SearchTypesEnum } from 'src/enum/searchType.enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Roles(RoleSlug.MASTER, RoleSlug.MANAGER)
  @Post()
  async create(
    @Body() body: RegisterDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { sub } = request['user'];

      const employee = await this.employeesService.create(body, +sub);

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

      throw new HttpException(
        e.message.replace(/(\r\n|\n|\r)/gm, ''),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Roles(RoleSlug.MASTER, RoleSlug.MANAGER)
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('perPage') perPage = '10',
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { sub } = request['user'];

      const employees = await this.employeesService.findAll(
        +page,
        +perPage,
        +sub,
      );

      return response.status(HttpStatus.OK).json(employees);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(RoleSlug.MASTER, RoleSlug.MANAGER)
  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('type') type: SearchTypesEnum,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { sub } = request['user'];

      const search = await this.employeesService.search(q, type, +sub);

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
        const statusCode =
          e.name === 'NotFoundError'
            ? HttpStatus.NOT_FOUND
            : HttpStatus.BAD_REQUEST;

        throw new HttpException(
          {
            status: statusCode,
            // Remove todos os "\n" para exibir uma mensagem de erro mais legível
            error: e.message.replace(/(\r\n|\n|\r)/gm, ''),
          },
          statusCode,
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
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { sub } = request['user'];

      await this.employeesService.update(+id, body, +sub);

      return response.status(HttpStatus.NO_CONTENT).end();
    } catch (e) {
      console.log(e);
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        const statusCode =
          e.name === 'NotFoundError'
            ? HttpStatus.NOT_FOUND
            : HttpStatus.BAD_REQUEST;

        throw new HttpException(
          {
            status: statusCode,
            // Remove todos os "\n" para exibir uma mensagem de erro mais legível
            error: e.message.replace(/(\r\n|\n|\r)/gm, ''),
          },
          statusCode,
        );
      }

      if (e.response.status === HttpStatus.UNAUTHORIZED) {
        throw e;
      }

      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(RoleSlug.MASTER, RoleSlug.MANAGER)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { sub } = request['user'];

      await this.employeesService.delete(+id, +sub);

      return response.status(HttpStatus.NO_CONTENT).end();
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        const statusCode =
          e.code === 'P2025' ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;

        throw new HttpException(
          {
            status: statusCode,
            error: e.meta.cause,
          },
          statusCode,
          {
            cause: e,
          },
        );
      }

      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
