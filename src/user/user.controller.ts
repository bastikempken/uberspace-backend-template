import { Body, Controller, Post } from "@nestjs/common";
import { LoginDto } from "./login.dto";
import { UserService } from "./user.service";

@Controller('user')
export class UserController {

    constructor(
        private readonly userService: UserService
    ) {}

    @Post('/login')
    async login(@Body() dto: LoginDto): Promise<any> {
        return this.userService.login(dto.token);
    }
}