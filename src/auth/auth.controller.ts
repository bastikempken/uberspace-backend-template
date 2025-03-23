import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './login.dto';
import { Public } from './public-decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @Public()
  async login(@Body() { token }: LoginDto): Promise<any> {
    return this.authService.login(token);
  }
}
