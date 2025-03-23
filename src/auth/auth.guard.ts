import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public-decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { TokenModel } from './token.model';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  private readonly jwtSecret: string;
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    readonly configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.jwtSecret = configService.getOrThrow('JWT_SECRET');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const { email } = await this.jwtService.verifyAsync<TokenModel>(token, {
        secret: this.jwtSecret,
      });

      const user = await this.userRepository.findOneBy({ email });
      if (user === null) {
        throw new NotFoundException();
      }
      request['user'] = user;
    } catch (e: unknown) {
      this.logger.error('error in auth guard', e);
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    // eslint-disable-next-line
    const [type, token]: string[] =
      request?.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
