import { Injectable, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEventUserDto } from 'src/event/dto/createEventUser.dto';
import { EventUserEntity } from 'src/event/dto/eventUser.entity';
import { SearchEventUserDto } from 'src/event/dto/searchEventUser.dto';
import { UpdateEventUserDto } from 'src/event/dto/updateEventUser.dto';
import { Repository } from 'typeorm';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(EventUserEntity)
    private eventUserRepository: Repository<EventUserEntity>,
  ) {}

  async createEventUser(eventUser: CreateEventUserDto): Promise<EventUserEntity> {
    try {
      const { title, description } = eventUser;
      const create_record = this.eventUserRepository.create({
        title,
        description,
      });
      await this.eventUserRepository.save(create_record);

      console.log(`Created new record : ${JSON.stringify(create_record)}`);
      return create_record;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getSingleUser(id: string): Promise<EventUserEntity> {
    try {
      const single_user = await this.eventUserRepository.findOneBy({ id });
      console.log(single_user);
      if (!single_user) {
        throw new NotFoundException(`No Data Available for ${id}!`);
      }
      return single_user;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async deleteSingleUser(id: string): Promise<void> {
    console.log(`User deleted successfully : ${id}`);
    try {
      const deleted_user = await this.eventUserRepository.delete(id);
      console.log(`User deleted successfully : ${id}`);
      if (deleted_user.affected === 0) {
        throw new NotFoundException(
          `ID: ${id} Not Found. No Delete Operation completed !`,
        );
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateUser(
    id: string,
    eventUser: UpdateEventUserDto,
  ): Promise<EventUserEntity> {
    try {
      await this.eventUserRepository.update(id, eventUser);
      return await this.getSingleUser(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async searchUser(
    searchEventUser: SearchEventUserDto,
  ): Promise<EventUserEntity[]> {
    try {
      const { search } = searchEventUser;
      const query =
        this.eventUserRepository.createQueryBuilder('eventUser');
      if(search){
        query.andWhere('(LOWER(eventUser.title) LIKE LOWER(:searchTerm) OR LOWER(eventUser.description) LIKE LOWER(:searchTerm))', {searchTerm: `%${search}%`});
      }else {
        throw new NotFoundException(`Search Term Not Found in User Input !`);
      }
      return await query.getMany();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
