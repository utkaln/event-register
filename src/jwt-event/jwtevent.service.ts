import { Injectable, Logger, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JWTUserEntity } from 'src/jwt/dto/jwtuser.entity';
import { Repository } from 'typeorm';
import { JWTEventUserEntity } from './dto/eventUser.entity';
import { CreateJwtEventUserDto } from './dto/createEventUser.dto';
import { SearchJwtEventUserDto } from './dto/searchEventUser.dto';
import { UpdateJwtEventUserDto } from './dto/updateEventUser.dto';

@Injectable()
export class JwtEventService {
  constructor(
    @InjectRepository(JWTEventUserEntity)
    private eventUserRepository: Repository<JWTEventUserEntity>,
  ) {}
  private logger = new Logger('JwtEventService');

  async createEventUser(
    eventUser: CreateJwtEventUserDto,
    jwtUser: JWTUserEntity,
  ): Promise<JWTEventUserEntity> {
    try {
      const { title, description } = eventUser;
      const create_record = this.eventUserRepository.create({
        title,
        description,
        jwtuser: jwtUser,
      });
      await this.eventUserRepository.save(create_record);

      this.logger.log(`Created new record : ${JSON.stringify(create_record)}`);
      return create_record;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getSingleUser(
    id: string,
    user: JWTUserEntity,
  ): Promise<JWTEventUserEntity> {
    try {
      const single_user = await this.eventUserRepository.findOneBy({
        id,
        jwtuser: user,
      });
      this.logger.log(single_user);
      if (!single_user) {
        throw new NotFoundException(`No Data Available for ${id}!`);
      }
      return single_user;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async deleteSingleUser(id: string, user: JWTUserEntity): Promise<void> {
    try {
      const deleted_user = await this.eventUserRepository.delete({id, jwtuser: user});
      if (deleted_user.affected === 0) {
        this.logger.log(`ID: ${id} Not Found. No Delete Operation completed ! `);
        throw new NotFoundException(
          `ID: ${id} Not Found. No Delete Operation completed !`,
        );
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
    this.logger.log(`User deleted successfully : ${id}`);
  }

  async updateUser(
    id: string,
    eventUser: UpdateJwtEventUserDto,
    user: JWTUserEntity,
  ): Promise<JWTEventUserEntity> {
    try {
      await this.eventUserRepository.update({ id, jwtuser: user }, eventUser);
      return await this.getSingleUser(id, user);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async searchUser(
    searchEventUser: SearchJwtEventUserDto,
    user: JWTUserEntity,
  ): Promise<JWTEventUserEntity[]> {
    try {
      const { search } = searchEventUser;
      const query = this.eventUserRepository.createQueryBuilder('eventUser');
      query.where({ jwtuser: user });
      if (search) {
        query.andWhere(
          '(LOWER(eventUser.title) LIKE LOWER(:searchTerm) OR LOWER(eventUser.description) LIKE LOWER(:searchTerm))',
          { searchTerm: `%${search}%` },
        );
      } else {
        throw new NotFoundException(`Search Term Not Found in User Input !`);
      }
      return await query.getMany();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
