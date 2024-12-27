import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUserEntity, UserType } from './dto/authuser.entity';
import { Repository } from 'typeorm';
import { AuthUserDto } from './dto/authuser.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthUserEntity)
    private authUserRepository: Repository<AuthUserEntity>,
  ) {}

  async signupUser(signupUserDto: AuthUserDto): Promise<void> {
    const { username, password } = signupUserDto;
    const type = UserType.PENDING;
    try {
      const authUser = this.authUserRepository.create({ username, password, type });
      await this.authUserRepository.save(authUser);
    } catch (error) {
      if(error.code === '23505') {
        throw new NotFoundException('Username already exists ! Try a different one.');
       } else
        throw new NotFoundException(error.message); 
    }
  }

  async signinUser(signinUserDto: AuthUserDto): Promise<string> {
    const { username, password } = signinUserDto;
    const authUser = await this.authUserRepository.findOneBy({ username });
    if (authUser && authUser.password === password) {
      return 'Authentication Successful !';
    } else {
      throw new NotFoundException('Invalid username or password !');
    }
  }
}
