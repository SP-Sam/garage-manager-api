import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Prisma } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto, @Res() response: Response) {
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

  @Post('login')
  async login(@Body() body: LoginDto, @Res() response: Response) {
    try {
      const token = await this.authService.login(body);

      return response.status(HttpStatus.OK).json(token);
    } catch (e) {
      if (
        e.response.status === HttpStatus.NOT_FOUND ||
        e.response.status === HttpStatus.UNAUTHORIZED
      ) {
        throw e;
      }

      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
