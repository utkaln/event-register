import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JWTUserEntity, UserType } from './dto/jwtuser.entity';
import { Repository } from 'typeorm';
import { JWTUserDto } from './dto/jwtuser.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwtpayload.interface';

@Injectable()
export class JWTAuthService {
  constructor(
    @InjectRepository(JWTUserEntity)
    private authUserRepository: Repository<JWTUserEntity>,
    private jwtService: JwtService,
  ) {}

  async signupUser(signupUserDto: JWTUserDto): Promise<void> {
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

  async signinUser(signinUserDto: JWTUserDto): Promise<{accessToken:string}> {
    const { username, password } = signinUserDto;
    const authUser = await this.authUserRepository.findOneBy({ username });
    if (authUser && authUser.password === password) {
      const type = authUser.type;
      const payload: JwtPayload = { username, type };
      const accessToken: string = await this.jwtService.sign(payload);
      return {accessToken};
    } else {
      throw new NotFoundException('Invalid username or password !');
    }
  }
}
