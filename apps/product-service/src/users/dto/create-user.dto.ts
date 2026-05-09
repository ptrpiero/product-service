import { IsNotEmpty, IsString } from "class-validator";

export class CreateUserDTO {
    @IsString()
    @IsNotEmpty()
    id!: string;
    @IsString({
        message: 'Error message'
    })
    @IsNotEmpty()
    username!: string;
}