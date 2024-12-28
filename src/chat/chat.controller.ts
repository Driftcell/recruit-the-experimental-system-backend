import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserAuthGuard } from 'src/auth/auth.guard';
import { ChatService } from './chat.service';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('chat')
@UseGuards(UserAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(@Request() req) {
    return this.chatService.create(req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.chatService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(id);
  }

  @Get('messages/:id')
  findMessages(@Param('id') id: string) {
    return this.chatService.findMessages(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(id);
  }
}
