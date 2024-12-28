import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from './config/config.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    UserModule,
    ChatModule,
    AuthModule,
    SyncModule,
  ],
})
export class AppModule {}
