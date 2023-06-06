import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private prismaService: PrismaService) {}

  async create(data: CreateVehicleDto) {
    return this.prismaService.vehicle.create({ data });
  }

  async findAll(customerId: number) {
    return this.prismaService.vehicle.findMany({
      where: { customerId },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prismaService.vehicle.findUniqueOrThrow({ where: { id } });
  }

  async update(id: number, data: UpdateVehicleDto) {
    return this.prismaService.vehicle.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prismaService.vehicle.delete({ where: { id } });
  }
}
