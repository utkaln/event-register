import { JWTEventUserEntity } from "src/jwt-event/dto/eventUser.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";


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

export enum UserType {
    GUEST = 'GUEST',
    PENDING = 'PENDING',
    TRIAL = 'TRIAL',
    PREMIUM = 'PREMIUM',
    BENEFACTOR = 'BENEFACTOR',
}