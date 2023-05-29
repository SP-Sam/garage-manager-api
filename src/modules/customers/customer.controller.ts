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
import { Request, Response } from 'express';
import { Prisma, RoleSlug } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { CustomersService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { SearchTypesEnum } from 'src/enum/searchType.enum';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles(RoleSlug.MASTER, RoleSlug.MANAGER)
  @Post()
  async create(
    @Body() body: CreateCustomerDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { sub } = request['user'];

      const customer = await this.customersService.create(body, +sub);

      return response.status(HttpStatus.CREATED).json(customer);
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
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { sub } = request['user'];

      const customers = await this.customersService.findAll(
        +page,
        +perPage,
        +sub,
      );

      return response.status(HttpStatus.OK).json(customers);
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

      const search = await this.customersService.search(q, type, +sub);

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
      const customer = await this.customersService.findUnique(+id);

      return response.status(HttpStatus.OK).json(customer);
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
    @Body() body: UpdateCustomerDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { sub } = request['user'];

      await this.customersService.update(+id, body, +sub);

      return response.status(HttpStatus.NO_CONTENT).end();
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

      if (e.response.status === HttpStatus.UNAUTHORIZED) {
        throw e;
      }

      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(RoleSlug.MASTER, RoleSlug.MANAGER)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { sub } = request['user'];

      await this.customersService.remove(+id, +sub);

      return response.status(HttpStatus.NO_CONTENT).end();
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

      if (e.response.status === HttpStatus.UNAUTHORIZED) {
        throw e;
      }

      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
