import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [SyncController],
  providers: [SyncService],
  imports: [PrismaModule],
})
export class SyncModule {}
