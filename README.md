## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Project Construction
- New Nest project creation 
```bash
nest new event-register
```
- Create new module
```bash
nest g module event --no-spec
```
- Create new controller
```bash
nest g controller event --no-spec
```
- Create new service
```bash
nest g service event --no-spec
```
### Create a new dto
```typescript
//EventUser.dto.ts
export class EventUser{
    title:string;
    description:string;
    lastUpdatedAt:string;
}
```
### Apply Pipe to validate
- Install packages
```bash
npm i class-validator class-transformer
```
- Make changes to DTO for validation
```typescript
//EventUser.dto.ts
import { IsNotEmpty } from "class-validator";
export class EventUser{
    @IsNotEmpty()
    title:string;

    @IsNotEmpty()
    description:string;

    @IsNotEmpty()
    lastUpdatedAt:string;

}
```
- Apply validatior at application level
```typescript
//main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

### Auto Exception Handling
```typescript
// returns 404 Not Found
throw new NotFoundException(`No Data Available for ${id}!`); 
```

### Database Connection
- Install the required libraries to use ORM and Postgres DB
```bash
npm install typeorm @nestjs/typeorm pg
```
- Quick and NOT Optimal way is to import it to App Module for the whole app
```typescript
// event.controller.ts
@Module({
  //TODO - Temporary ORM module for DB Connection, remove from here
  imports: [EventModule, TypeOrmModule.forRoot({
    type:'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '<redacted>',
    database: 'event-registration',
    autoLoadEntities: true,
    synchronize: true,
    entities:[EventUserEntity]
  })],
  controllers: [AppController,EventController],
  providers: [AppService,EventService],
})
export class AppModule {}
```
- Add reference in module class for DB access
```typescript
// event.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([EventUserEntity])],
  controllers: [EventController],
  providers: [EventService],
  exports:[TypeOrmModule]
})
export class EventModule {}
```

- Use DTO objects for transferring data from request to service layer for consistent data format
```typescript
// createEventUser.dto.class
export class CreateEventUserDto{
    @IsNotEmpty()
    title:string;

    @IsNotEmpty()
    description:string;

}
```

- Core DB logic and query is written in the service class
```typescript
//event.service.ts
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
}
```
- Use curl command to test out 
```bash
curl -X POST http://localhost:3000/event -H 'Content-Type: application/json' -d '{"title":"Utkal Nayak","description":"I love to travel and love to go to beaches. I like reading about technology."}'
```
- Remember while using ? in curl command for query parameter, remember to put the command part within quote marks to escape ? being treated as wild char by bash shell 


## Authentication
- Create a new module, service and controller for auth
```bash
nest g module auth
nest g service auth --no-spec
nest g controller auth --no-spec
```

- Auth module, service and controller should be auto referred in app module with this creation process, otherwise manually enter references to app module to ensure it works

- Create a new entity for ORM interaction of the user object
```typescript
//authuser.entity.ts
@Entity()
export class AuthUserEntity {
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    username:string;
    
    @Column()
    password:string;
    
    @Column()
    type:string;

}
```

- Add reference to Auth User Entity in the Auth Module 
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([AuthUserEntity])],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
```

- Most logic for auth will be in service class, create a reference to Entity wrapped with Repository for ORM interaction
```typescript
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthUserEntity)
        private authUserRepository: Repository<AuthUserEntity>
    ){}
}
```

- Create DTO object for accepting input from request in a consistent format
```typescript
//signup.dto.ts
export class signupUserDto{
    @IsNotEmpty()
    username:string;

    @IsNotEmpty()
    password:string;

}
```
### JWT Based Authentication
#### How JWT Works
- JWT is a token based validation information, that securely returns required information post authentication
- A typical JWT token has three parts : 
  1. Header : Algorithm and Token Type
  2. Payload : This has the actual data such as user name, expiration of token, and user scope etc. in encoded format
  3. Signature : This has the same data as payload but in encrypted format, that can only be created from the server. This helps validate the payload integrity
- More info : [jwt.io](https://jwt.io)
- To experiment with JWT based auth install following libraries
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt @types/passport-jwt
```
- Changes to Auth Module to use jwt. The JWT module below imported is going to help in creating tokens
```typescript
//jwt.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([JWTUserEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      // TODO: Change this secret key to a more secure one
      secret: 'changeIt',
      signOptions: {
        expiresIn: '1h',
      },
    })
  ],
  providers: [JWTAuthService, JwtStrategy],
  controllers: [JWTController],
  exports: [JwtStrategy, PassportModule],
})
export class JWTAuthModule {}
```
- Changes to jwt service class to implement JWT token changes
```typescript
//jwt.service.ts
@Injectable()
export class JWTAuthService {
  constructor(
    @InjectRepository(JWTUserEntity)
    private authUserRepository: Repository<JWTUserEntity>,
    private jwtService: JwtService,
  ) {}
}
```
- The method to implement JWT token generation, first create an interface to capture user info, instead of using a string
```typescript
export interface JwtPayload {
    username: string;
    type: string;
}
```
- Implement changes in service class so it returns a valid token upon successful auth
```typescript
//jwt.service.ts
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
```

- JWT Validation : 
  - library @types/passport-jwt is used
  - Use Jwt Strategy for implementation. More info https://www.passportjs.org/packages/passport-jwt/
  - Implementation of JWT Strategy: 
  ```typescript
  //jwt.strategy.ts
  import { JWTUserEntity } from "./jwtuser.entity";
  import { Repository } from "typeorm";
  import { JwtPayload } from "../jwtpayload.interface";

  @Injectable()
  export class JwtStrategy extends PassportStrategy(Strategy){
      constructor(
          @InjectRepository(JWTUserEntity)
          private authUserRepository: Repository<JWTUserEntity>,
        ) {
          super(
              {
                  // The secret must match to the secret used in the module class
                  secretOrKey: 'changeIt',
                  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
              }
          );
        }

        async validate(payload: JwtPayload): Promise<JWTUserEntity> {
          const { username } = payload;
          const user: JWTUserEntity = await this.authUserRepository.findOneBy({ username });
          if (!user) {
            throw new UnauthorizedException();
          }
          return user;
        }
  }
  ```
  - To make the validation available to other modules make following changes to module class
  ```typescript
  providers: [JWTAuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
  ```

- Validation is done better with Decorator. Implementation : 
```typescript
//jwtuser.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JWTUserEntity } from './dto/jwtuser.entity';

export const getJwtUser = createParamDecorator(
  (data, ctx: ExecutionContext): JWTUserEntity => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

```

#### Guarding Routes with Auth
- Add the following guard to Controller class
```typescript
@Controller('/auth-event')
@UseGuards(AuthGuard('jwt'))
```

## Link one table to another
- In most practical cases, based on the user the other activities are updated to DB in another table. Example: User registers for Event. One user can have multiple events, hence a new one-to-many relationship needs to be established. Similarly on the other side, an Event need to have many-to-one relationship
- Implementation of one-to-many in User Entity
```typescript
@Entity()
export class JWTUserEntity {
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column({ unique:true })
    username:string;
    
    @Column()
    password:string;
    
    @Column()
    type:UserType;

    @OneToMany(() => JWTEventUserEntity, (eventUser) => eventUser.jwtuser) // specify inverse side as a second parameter
    eventEntities:JWTEventUserEntity[];  

}
```
- Implementation of many-to-one in Event Entity
```typescript
@Entity()
export class JWTEventUserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    title: string

    @Column() 
    description: string

    @CreateDateColumn()
    created_at: Date; // Creation date

    @UpdateDateColumn()
    updated_at: Date; // Last updated date

    @ManyToOne(() => JWTUserEntity, (user) => user.eventEntities) // specify inverse side as a second parameter
    jwtuser: JWTUserEntity; 
     
}
```
- Associate Service calls that make DB entry to use user object while creating event
- Changes to Controller class : 
```typescript
//jwtevent.controller.ts
@Post()
async createEventUser(
  @Body() createUser: CreateJwtEventUserDto,
  @getJwtUser() user: JWTUserEntity,
): Promise<JWTEventUserEntity> {
  return await this.eventService.createEventUser(createUser, user);
}
```
- Changes to service class
```typescript
//jwtevent.service.ts
export class JwtEventService {
  constructor(
    @InjectRepository(JWTEventUserEntity)
    private eventUserRepository: Repository<JWTEventUserEntity>,
  ) {}

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

      console.log(`Created new record : ${JSON.stringify(create_record)}`);
      return create_record;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
```

### Restrict data fetch to only data related to user logged on
- Serialize get data calls by passing user object to filter the data fetched
- Changes to service class :
```typescript
async searchUser(
  searchEventUser: SearchJwtEventUserDto,
  user: JWTUserEntity,
): Promise<JWTEventUserEntity[]> {
  try {
    const { search } = searchEventUser;
    const query = this.eventUserRepository.createQueryBuilder('eventUser');
    query.where({jwtuser: user});
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
```

### Limit exposure of sensitive information
- Suppress sensitive information from the http response using Transformer
- To achieve this a request Interceptor is applied first at root level. Implementation : 
```typescript
//transform.interceptor.ts
@Injectable()
export class TransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(map(data => instanceToPlain(data))); 
    }
}
```
- Add the following reference code in main.ts file to use the transformer
```typescript
//main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```


## Configuration of Environment settings

- Centrally control the values of environmental variables in a secured way. This allows sensitive info such as db info, passwords etc.

### Setup Environment variables using Config
- Simplest way is to add environment variable to the OS on which the app is running
- More optimal way is to add with NestJS provided library `@nestjs/config`
```bash
npm install @nestjs/config
```
- Define environment files at the root of the project, named as : `.env.stage.dev`
- Update app module to include config file and refer to the stage file :
```typescript
imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.stage.${process.env.STAGE}`,
    }), ... 
```
- Update `package.json` script area to introduce environment variable `STAGE=dev`
```bash
"start:dev": "STAGE=local nest start --watch",
```

### Use Environment variables
- Update module files to import ConfigModule that is referred in the app module
```typescript
//jwt.module.ts
imports: [
    ConfigModule,
    TypeOrmModule.forFeature([JWTUserEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ...
```
- Importing config module automatically makes a config service as injectable object
```typescript
//jwt.controller.ts
@Controller('jwt')
export class JWTController {
  constructor(
    private authService: JWTAuthService,
    private configService: ConfigService,
  ) {}
  ...
```
- Update app.module.ts file to use Config Service for DB initialization from environment variables. Pay attention that now it is going to be initialized as Async
```typescript
@Module({
  //TODO - Temporary ORM module for DB Connection, remove from here
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.stage.${process.env.STAGE}`,
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
```


### Schema Validation using Joi 
- Required in case any environment variables required are missing
- Use the following library to install `joi`
```bash
npm install joi
```
- Define a config validation file
```typescript
//config.schema.ts
import * as Joi from 'joi';
export const configValidationSchema = Joi.object({
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    STAGE: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
}); 
```
- Refer to this in app module
```typescript
//app.module.ts
ConfigModule.forRoot({
  envFilePath: `.env.stage.${process.env.STAGE}`,
  validationSchema: configValidationSchema,
}),
...
```
- Secret password generated and locally saved from https://www.grc.com/passwords.htm 


