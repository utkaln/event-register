import { Module } from '@nestjs/common';
import { JwtEventController } from './jwtevent.controller';
import { JwtEventService } from './jwtevent.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventUserEntity } from 'src/event/dto/eventUser.entity';
import { JWTEventUserEntity } from './dto/eventUser.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JWTEventUserEntity])],
  controllers: [JwtEventController],
  providers: [JwtEventService],
  exports:[TypeOrmModule]
})
export class JwtEventModule {}
