import { createKeyv, Keyv } from '@keyv/redis';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheableMemory } from 'cacheable';

import { AuthModule } from './app/auth/auth.module';
import { CreditModule } from './app/credit/credit.module';
import { CustomerModule } from './app/customer/customer.module';
import { SharedModule } from './app/shared/shared.module';
import { UserModule } from './app/user/user.module';
import { AppController } from './app.controller';
import { config } from './config';
import { HttpExceptionFilter } from './handlers/exceptions/http-exception.filter';

@Module({
  imports: [
    MongooseModule.forRoot(config.db.url),
    BullModule.forRoot({
      redis: {
        host: config.redis.host,
        port: config.redis.port,
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [
            new Keyv({ store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }) }),
            createKeyv(config.redis.url),
          ],
        };
      },
    }),
    AuthModule,
    UserModule,
    SharedModule,
    CustomerModule,
    CreditModule,
  ],
  controllers: [AppController],
  providers: [
    {
      useClass: HttpExceptionFilter,
      provide: APP_FILTER,
    },
  ],
})
export class AppModule {}
