import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  sampleDelete(): string {
    return 'Hello Delete !'
  }
}
