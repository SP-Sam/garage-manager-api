import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CarPartsService } from './car-parts.service';
import { CreateCarPartDto } from './dto/create-car-part.dto';
import { UpdateCarPartDto } from './dto/update-car-part.dto';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('car-parts')
export class CarPartsController {
  constructor(private readonly carPartsService: CarPartsService) {}

  @Post()
  async create(@Body() body: CreateCarPartDto, @Res() response: Response) {
    try {
      const carParts = await this.carPartsService.create(body);

      return response.status(HttpStatus.CREATED).json(carParts);
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
    @Res() response: Response,
  ) {
    try {
      const carParts = await this.carPartsService.findAll(+page, +perPage);

      return response.status(HttpStatus.OK).json(carParts);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('type') type: string,
    @Res() response: Response,
  ) {
    try {
      const searchTerm = type === 'id' ? +q : q;

      if (Number.isNaN(searchTerm)) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'searchTerm must be a valid value',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const searchResult = await this.carPartsService.search(searchTerm);

      return response.status(HttpStatus.OK).json(searchResult);
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
      const carPart = await this.carPartsService.findOne(+id);

      return response.status(HttpStatus.OK).json(carPart);
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
    @Body() body: UpdateCarPartDto,
    @Res() response: Response,
  ) {
    try {
      await this.carPartsService.update(+id, body);

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
  async remove(@Param('id') id: string, @Res() response: Response) {
    try {
      await this.carPartsService.remove(+id);

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
