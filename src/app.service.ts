import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return { message: 'Garage Manager API - v1.0.0' };
  }
}
