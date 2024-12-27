import { Exclude } from "class-transformer";
import { JWTUserEntity } from "src/jwt/dto/jwtuser.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
    @Exclude({ toPlainOnly: true }) // Exclude this field from plain object such as json or plain text
    jwtuser: JWTUserEntity; 
     
}