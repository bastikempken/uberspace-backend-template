import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './v1/user/user.entity';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { V1Module } from './v1/v1.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    V1Module,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        return {
          type: 'postgres',
          host: configService.getOrThrow('DB_HOST'),
          port: 5432,
          password: configService.getOrThrow('DB_PW'),
          username: configService.getOrThrow('DB_USER'),
          entities: [User],
          database: configService.getOrThrow('DB_NAME'),
          synchronize: true,
          logging: false,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    Logger,
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
