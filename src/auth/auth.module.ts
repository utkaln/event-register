import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthUserEntity } from './dto/authuser.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthUserEntity])],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
