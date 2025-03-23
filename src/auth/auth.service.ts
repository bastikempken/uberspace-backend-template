import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { TokenInfo } from './token-info.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

    private readonly logger = new Logger(AuthService.name);

    private userEndpoint: string;

    constructor(
        private readonly jwtService: JwtService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {
        this.userEndpoint = this.configService.getOrThrow('GOOGLE_USER_ENDPOINT')
        this.logger.log('user endpoint: ' + this.userEndpoint)
    }


    public async verifyToken(accessToken: string): Promise<TokenInfo> {
        try {
            const request = this.httpService.get<TokenInfo>(this.userEndpoint, {
                params: {
                    'access_token': accessToken
                }
            })
            const { data } = await lastValueFrom(request);
            return data
        } catch (e: unknown) {
            this.logger.error('error during token verification', e)
            throw new UnauthorizedException()
        }
    }

    public async sign(userId: string): Promise<string> {
        return this.jwtService.sign({
            sub: 'todo-user-id',
            email: 'todo-email'
        })

    }
}
