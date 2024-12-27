import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";


@Entity()
export class AuthUserEntity {
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column({ unique:true })
    username:string;
    
    @Column()
    password:string;
    
    @Column()
    type:UserType;

}

export enum UserType {
    GUEST = 'GUEST',
    PENDING = 'PENDING',
    TRIAL = 'TRIAL',
    PREMIUM = 'PREMIUM',
    BENEFACTOR = 'BENEFACTOR',
}