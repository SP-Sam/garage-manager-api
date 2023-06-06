import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  async create(@Body() body: CreateVehicleDto, @Res() response: Response) {
    try {
      const vehicle = await this.vehiclesService.create(body);

      return response.status(HttpStatus.CREATED).json(vehicle);
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

  @Get('customer/:customerId')
  async findAll(
    @Param('customerId') customerId: string,
    @Res() response: Response,
  ) {
    try {
      const vehicles = await this.vehiclesService.findAll(+customerId);

      return response.status(HttpStatus.OK).json(vehicles);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response: Response) {
    try {
      const vehicle = await this.vehiclesService.findOne(+id);

      return response.status(HttpStatus.OK).json(vehicle);
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
    @Body() body: UpdateVehicleDto,
    @Res() response: Response,
  ) {
    try {
      await this.vehiclesService.update(+id, body);

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
      await this.vehiclesService.remove(+id);

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
