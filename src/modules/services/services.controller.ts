import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Request, Response } from 'express';
import { SearchTypesEnum } from 'src/enum/searchType.enum';

@UseGuards(AuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  async create(
    @Body() body: CreateServiceDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { sub } = request['user'];

      const service = await this.servicesService.create(body, +sub);

      return response.status(HttpStatus.CREATED).json(service);
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

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('perPage') perPage = '10',
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { sub } = request['user'];

      const services = await this.servicesService.findAll(
        +page,
        +perPage,
        +sub,
      );

      return response.status(HttpStatus.OK).json(services);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('type') type: SearchTypesEnum,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { sub } = request['user'];

      const searchTerm = type === 'employeeId' ? +q : q;

      if (Number.isNaN(searchTerm)) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'searchTerm must be a valid value',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const services = await this.servicesService.search(
        searchTerm,
        type,
        +sub,
      );

      return response.status(HttpStatus.OK).json(services);
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

      if (e.status === HttpStatus.BAD_REQUEST) {
        throw e;
      }

      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response: Response) {
    try {
      const service = await this.servicesService.findOne(+id);

      return response.status(HttpStatus.OK).json(service);
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

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateServiceDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { sub } = request['user'];

      await this.servicesService.update(+id, body, +sub);

      return response.status(HttpStatus.NO_CONTENT).end();
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: e.meta.cause,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { sub } = request['user'];

      await this.servicesService.remove(+id, +sub);

      return response.status(HttpStatus.NO_CONTENT).end();
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: e.meta.cause,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
