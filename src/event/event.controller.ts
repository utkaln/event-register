import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventUserDto } from 'src/event/dto/createEventUser.dto';
import { EventUserEntity } from 'src/event/dto/eventUser.entity';
import { UpdateEventUserDto } from 'src/event/dto/updateEventUser.dto';
import { SearchEventUserDto } from 'src/event/dto/searchEventUser.dto';

@Controller('event')
export class EventController {
    constructor(private eventService:EventService){}
    
    @Delete(':id')
    async deleteSingleUser(@Param('id') id: string): Promise<void>{
        console.log(`About to delete: ${id}`);
        return await this.eventService.deleteSingleUser(id);
    }
    // Test : curl -X DELETE http://localhost:3000/event/319756d0-952a-4ae1-ab08-20a2cb4f57e0

    @Get(':id')
    async getSingleUser(@Param('id') id: string): Promise<EventUserEntity>{
        return await this.eventService.getSingleUser(id);
    }
    // Test : curl -X GET http://localhost:3000/event/319756d0-952a-4ae1-ab08-20a2cb4f57e0

    @Post()
    async createEventUser(@Body()  createUser: CreateEventUserDto): Promise<EventUserEntity>{
        return await this.eventService.createEventUser(createUser); 
    }
    // Test : curl -X POST http://localhost:3000/event -H 'Content-Type: application/json' -d '{"title":"Utkal Nayak","description":"Travelers Insurance"}'

    @Patch(':id')
    async updateUser(@Body() updateUser:UpdateEventUserDto, @Param('id') id:string): Promise<EventUserEntity>{
        return await this.eventService.updateUser(id, updateUser);
    }
    // Test : curl -X PATCH http://localhost:3000/event/319756d0-952a-4ae1-ab08-20a2cb4f57e0 -H 'Content-Type: application/json' -d '{"title":"Utkal Nayak Updated","description":"Travelers Insurance Updated"}'

    @Get()
    async searchEventUsers(@Query() searchDto: SearchEventUserDto):Promise<EventUserEntity[]>{
        return await this.eventService.searchUser(searchDto);
    }
    // Test : curl -X GET 'http://localhost:3000/event?searchTerm=Utkal'


}
