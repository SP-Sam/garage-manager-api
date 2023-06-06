import { Injectable } from '@nestjs/common';
import { CreateCarPartDto } from './dto/create-car-part.dto';
import { UpdateCarPartDto } from './dto/update-car-part.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CarPartsService {
  constructor(private prismaService: PrismaService) {}

  async create(data: CreateCarPartDto) {
    return this.prismaService.carPart.create({ data });
  }

  async findAll(page = 1, perPage = 10) {
    const skip = page * perPage - perPage;

    return this.prismaService.carPart.findMany({
      skip,
      take: perPage,
      include: { _count: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prismaService.carPart.findUniqueOrThrow({ where: { id } });
  }

  async search(searchTerm: string | number) {
    if (typeof searchTerm === 'number') {
      return this.prismaService.carPart.findMany({
        where: { id: searchTerm },
        include: { _count: true },
      });
    } else {
      return this.prismaService.carPart.findMany({
        where: { name: { contains: searchTerm, mode: 'insensitive' } },
        include: { _count: true },
        orderBy: { name: 'asc' },
      });
    }
  }

  async update(id: number, data: UpdateCarPartDto) {
    return this.prismaService.carPart.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prismaService.carPart.delete({ where: { id } });
  }
}
