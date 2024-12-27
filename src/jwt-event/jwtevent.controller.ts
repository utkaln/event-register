import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtEventService } from './jwtevent.service';
import { AuthGuard } from '@nestjs/passport';
import { getJwtUser } from 'src/jwt/jwtuser.decorator';
import { JWTUserEntity } from 'src/jwt/dto/jwtuser.entity';
import { JWTEventUserEntity } from './dto/eventUser.entity';
import { CreateJwtEventUserDto } from './dto/createEventUser.dto';
import { UpdateJwtEventUserDto } from './dto/updateEventUser.dto';
import { SearchJwtEventUserDto } from './dto/searchEventUser.dto';

@Controller('/auth-event')
@UseGuards(AuthGuard('jwt'))
export class JwtEventController {
  constructor(private eventService: JwtEventService) {}
  private logger = new Logger('JwtEventController');

  @Delete(':id')
  async deleteSingleUser(
    @Param('id') id: string,
    @getJwtUser() user: JWTUserEntity,
  ): Promise<void> {
    this.logger.log(`About to delete: ${id}`);
    return await this.eventService.deleteSingleUser(id, user);
  }
  // Test : curl -X DELETE http://localhost:3000/auth-event/319756d0-952a-4ae1-ab08-20a2cb4f57e0

  @Get(':id')
  async getSingleUser(
    @Param('id') id: string,
    @getJwtUser() user: JWTUserEntity,
  ): Promise<JWTEventUserEntity> {
    this.logger.log(`Input id to get single user: ${id}`);
    return await this.eventService.getSingleUser(id, user);
  }
  // Test : curl -X GET http://localhost:3000/auth-event/319756d0-952a-4ae1-ab08-20a2cb4f57e0

  @Post()
  async createEventUser(
    @Body() createUser: CreateJwtEventUserDto,
    @getJwtUser() user: JWTUserEntity,
  ): Promise<JWTEventUserEntity> {
    this.logger.log(`Input data to create user: ${JSON.stringify(createUser)}`);
    return await this.eventService.createEventUser(createUser, user);
  }
  // Test : curl -X POST http://localhost:3000/auth-event -H 'Content-Type: application/json' -d '{"title":"Utkal Nayak","description":"Travelers Insurance"}'

  @Patch(':id')
  async updateUser(
    @Body() updateUser: UpdateJwtEventUserDto,
    @Param('id') id: string,
    @getJwtUser() user: JWTUserEntity,
  ): Promise<JWTEventUserEntity> {
    this.logger.log(`Input data to update user: ${JSON.stringify(updateUser)}`);
    return await this.eventService.updateUser(id, updateUser, user);
  }
  // Test : curl -X PATCH http://localhost:3000/auth-event/319756d0-952a-4ae1-ab08-20a2cb4f57e0 -H 'Content-Type: application/json' -d '{"title":"Utkal Nayak Updated","description":"Travelers Insurance Updated"}'

  @Get()
  async searchEventUsers(
    @Query() searchDto: SearchJwtEventUserDto,
    @getJwtUser() user: JWTUserEntity,
  ): Promise<JWTEventUserEntity[]> {
    this.logger.log(`Input data to search user: ${JSON.stringify(searchDto)}`);
    return await this.eventService.searchUser(searchDto, user);
  }
  // Test : curl -X GET 'http://localhost:3000/auth-event?searchTerm=Utkal'
}
