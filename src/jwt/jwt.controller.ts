import { Body, Controller, Post } from '@nestjs/common';
import { JWTUserDto } from './dto/jwtuser.dto';
import { JWTUserEntity } from './dto/jwtuser.entity';
import { JWTAuthService } from './jwt.service';
import { ConfigService } from '@nestjs/config';

@Controller('jwt')
export class JWTController {
  constructor(private authService: JWTAuthService) {}

  @Post('signup')
  async createEventUser(@Body() signupUserDto: JWTUserDto): Promise<void> {
    return await this.authService.signupUser(signupUserDto);
  }
  // Test : curl -X POST http://localhost:3000/jwt/signup -H 'Content-Type: application/json' -d '{"username":"unayak","password":"pwd123"}'

  @Post('signin')
  async signinUser(
    @Body() signinUserDto: JWTUserDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.signinUser(signinUserDto);
  }
  // Test : curl -X POST http://localhost:3000/jwt/signin -H 'Content-Type: application/json' -d '{"username":"unayak","password":"pwd123"}'
}
