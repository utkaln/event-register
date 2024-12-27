import { Module } from '@nestjs/common';
import { JWTAuthService } from './jwt.service';
import { JWTController } from './jwt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JWTUserEntity } from './dto/jwtuser.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './dto/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([JWTUserEntity]),
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [JWTAuthService, JwtStrategy],
  controllers: [JWTController],
  exports: [JwtStrategy, PassportModule],
})
export class JWTAuthModule {}
