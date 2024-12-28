import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(user) {
    return await this.prismaService.chat.create({
      data: {
        name: 'Chat',
        user: {
          connect: {
            id: user.sub,
          },
        },
      },
    });
  }

  async findAll(user) {
    return await this.prismaService.chat.findMany({
      where: {
        user: {
          id: user.sub,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    return await this.prismaService.chat.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async findMessages(id: string) {
    return await this.prismaService.message.findMany({
      where: {
        chatId: id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async update(id: string, updateChatDto: UpdateChatDto) {
    return await this.prismaService.chat.update({
      where: {
        id: id,
      },
      data: updateChatDto,
    });
  }

  async remove(id: string) {
    return await this.prismaService.chat.delete({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });
  }
}
