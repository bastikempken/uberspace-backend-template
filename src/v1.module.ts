import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

const apiVersion = 'v1';

const modules = [UserModule, AuthModule];

@Module({
  imports: [
    RouterModule.register(
      modules.map((module) => ({
        path: `/${apiVersion}`,
        module,
      })),
    ),
    ...modules,
  ],
  exports: [AuthModule],
})
export class V1Module {}
