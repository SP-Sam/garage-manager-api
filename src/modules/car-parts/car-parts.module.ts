import { Module } from '@nestjs/common';
import { CarPartsService } from './car-parts.service';
import { CarPartsController } from './car-parts.controller';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  controllers: [CarPartsController],
  providers: [CarPartsService, PrismaService],
})
export class CarPartsModule {}
