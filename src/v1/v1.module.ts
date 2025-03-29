import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { UserModule } from './user/user.module';

const apiVersion = 'v1';

const modules = [UserModule];

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
  exports: [],
})
export class V1Module {}
