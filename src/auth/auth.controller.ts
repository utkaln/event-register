import { Body, Controller, Post } from '@nestjs/common';
import { AuthUserDto } from './dto/authuser.dto';
import { AuthUserEntity } from './dto/authuser.entity';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService:AuthService){}

    @Post('signup')
        async createEventUser(@Body()  signupUserDto: AuthUserDto): Promise<void>{
            return await this.authService.signupUser(signupUserDto); 
        }
        // Test : curl -X POST http://localhost:3000/auth/signup -H 'Content-Type: application/json' -d '{"username":"unayak","password":"pwd123"}'
    
        @Post('signin')
        async signinUser(@Body()  signinUserDto: AuthUserDto): Promise<string>{
            return await this.authService.signinUser(signinUserDto); 
        }
        // Test : curl -X POST http://localhost:3000/auth/signin -H 'Content-Type: application/json' -d '{"username":"unayak","password":"pwd123"}'
    
    
}
