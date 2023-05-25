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
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma, RoleSlug } from '@prisma/client';

import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Roles(RoleSlug.MASTER)
  @Post()
  async create(@Body() body: CreateRoleDto, @Res() response: Response) {
    try {
      const role = await this.rolesService.create(body);

      return response.status(HttpStatus.CREATED).json(role);
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
  async findAll(@Res() response: Response) {
    try {
      const roles = await this.rolesService.findAll();

      return response.status(HttpStatus.OK).json(roles);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(RoleSlug.MASTER, RoleSlug.MANAGER)
  @Get(':id')
  async findById(@Param('id') id: string, @Res() response: Response) {
    try {
      const role = await this.rolesService.findUnique(+id);

      if (role == null) {
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Role not found' });
      }

      return response.status(HttpStatus.OK).json(role);
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

  @Roles(RoleSlug.MASTER)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
    @Res() response: Response,
  ) {
    try {
      await this.rolesService.update(+id, body);

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

  @Roles(RoleSlug.MASTER)
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() response: Response) {
    try {
      await this.rolesService.delete(+id);

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
