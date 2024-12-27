import { IsNotEmpty } from "class-validator";
export class CreateEventUserDto{
    @IsNotEmpty()
    title:string;

    @IsNotEmpty()
    description:string;

}