import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventModule } from './event/event.module';
import { EventController } from './event/event.controller';
import { EventService } from './event/event.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EventUserEntity } from './event/dto/eventUser.entity';
import { AuthModule } from './auth/auth.module';
import { JWTAuthModule } from './jwt/jwt.module';
import { JwtEventModule } from './jwt-event/jwtevent.module';
import { JwtEventController } from './jwt-event/jwtevent.controller';
import { JwtEventService } from './jwt-event/jwtevent.service';
import { JWTUserEntity } from './jwt/dto/jwtuser.entity';
import { JWTEventUserEntity } from './jwt-event/dto/eventUser.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';

@Module({
  //TODO - Temporary ORM module for DB Connection, remove from here
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.stage.${process.env.STAGE}`,
      validationSchema: configValidationSchema,
    }),
    EventModule, AuthModule, JWTAuthModule, JwtEventModule, 
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService):Promise<TypeOrmModuleOptions> => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
        entities:[EventUserEntity,JWTUserEntity, JWTEventUserEntity]
    }),
  }),
],
  controllers: [AppController,EventController, JwtEventController],
  providers: [AppService,EventService, JwtEventService],
})
export class AppModule {}
