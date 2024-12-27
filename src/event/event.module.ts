import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventUserEntity } from 'src/event/dto/eventUser.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventUserEntity])],
  controllers: [EventController],
  providers: [EventService],
  exports:[TypeOrmModule]
})
export class EventModule {}
