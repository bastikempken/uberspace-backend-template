import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { TokenInfo } from './token-info.dto';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly allowRegister: boolean;
  private readonly userEndpoint: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.userEndpoint = this.configService.getOrThrow('GOOGLE_USER_ENDPOINT');
    this.logger.log('user endpoint: ' + this.userEndpoint);
    this.allowRegister = configService.getOrThrow('ALLOW_REGISTER', false);
  }

  private async verifyToken(accessToken: string): Promise<TokenInfo> {
    try {
      const request = this.httpService.get<TokenInfo>(this.userEndpoint, {
        params: {
          access_token: accessToken,
        },
      });
      const { data } = await lastValueFrom(request);
      return data;
    } catch (e: unknown) {
      this.logger.error('error during token verification', e);
      throw new UnauthorizedException();
    }
  }

  private sign(userId: string, email: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }

  public async login(accessToken: string): Promise<string> {
    // TODO Exception
    const { name, given_name, family_name, email } =
      await this.verifyToken(accessToken);
    const userNew = new User();
    userNew.email = email;
    userNew.givenName = given_name;
    userNew.familyName = family_name;
    userNew.name = name;
    //this.userRepository.save(user)
    const user = await this.userRepository.findOneBy({ email });
    if (user === null) {
      throw new UnauthorizedException();
    }
    return this.sign(user.id, user.email);
  }
}
