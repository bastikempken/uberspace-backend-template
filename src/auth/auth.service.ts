import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { TokenInfo } from './token-info.dto';
import { ConfigService } from '@nestjs/config';
import { User } from '../v1/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly allowRegister: boolean;
  private readonly allowedUser: string[];
  private readonly userEndpoint: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.userEndpoint = this.configService.getOrThrow('GOOGLE_USER_ENDPOINT');
    this.logger.log('user endpoint: ' + this.userEndpoint);
    this.allowRegister = configService.getOrThrow<boolean>(
      'ALLOW_REGISTER',
      false,
    );
    this.allowedUser = configService.get<string>('ALLOWED_USER', '').split(',');
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

  private sign({ id, email, givenName, familyName }: User): string {
    return this.jwtService.sign({
      sub: id,
      email,
      givenName,
      familyName,
    });
  }

  private async saveUser(tokenInfo: TokenInfo): Promise<User> {
    const user = new User();
    user.email = tokenInfo.email;
    user.givenName = tokenInfo.given_name;
    user.familyName = tokenInfo.family_name;
    return this.userRepository.save(user);
  }

  public async login(accessToken: string): Promise<string> {
    const tokenInfo = await this.verifyToken(accessToken);
    const { email } = tokenInfo;
    const user = await this.userRepository.findOneBy({ email });
    if (user !== null) {
      return this.sign(user);
    } else if (!this.allowRegister && !this.allowedUser.includes(email)) {
      throw new UnauthorizedException();
    }
    const newUser = await this.saveUser(tokenInfo);
    return this.sign(newUser);
  }
}
