import { IsNotEmpty } from "class-validator";
export class CreateJwtEventUserDto{
    @IsNotEmpty()
    title:string;

    @IsNotEmpty()
    description:string;

}