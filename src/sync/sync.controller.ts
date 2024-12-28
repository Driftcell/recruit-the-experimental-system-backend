import { Body, Controller, Get, Post } from '@nestjs/common';
import { SyncService } from './sync.service';
import { CreateSyncDto } from './dto/create-sync.dto';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('projects')
  projects() {
    return this.syncService.listProjects();
  }

  @Post('all')
  syncAll(@Body() createSyncDto: CreateSyncDto) {
    return this.syncService.syncAll(createSyncDto.projectId);
  }
}
