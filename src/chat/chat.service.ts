import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(user) {
    const chat = await this.prismaService.chat.create({
      data: {
        name: 'Chat',
        user: {
          connect: {
            id: user.sub,
          },
        },
      },
    });

    // 这里需要加入system prompt，以及最开始的用户引导词
    await this.prismaService.message.create({
      data: {
        role: 'system',
        content:
          '在用户回答完心情时，从以下几点挑选回复：1.在过去两周里，你觉得自己的心情整体状况如何？有什么特别的事情想要和我聊聊吗？2.试着回想一下怀孕之初或产后最初几周时的心情，与现在相比有什么变化吗？3.最近有什么让你困扰的事情吗？可以具体跟我讲讲发生了什么吗？4.“在过去6个月里，你有没有经历过比较重大的变动——比如搬家、工作变动、家庭关系变化等？它们对你的情绪或日常生活带来怎样的影响？5.孕期或产后，作为妈妈，你觉得遇到的最大挑战是什么？能具体讲一讲吗？',
        chat: { connect: { id: chat.id } },
      },
    });
    await this.prismaService.message.create({
      data: {
        role: 'assistant',
        content:
          'hi~妈妈,我是你的专属智能健康助手小智，今天的心情怎么样？ 选项：开心/平和，压力/疲惫，焦虑/担忧，难过/悲伤，烦躁/愤怒，失望/失落，愧疚/羞耻，无奈/冷漠',
        chat: { connect: { id: chat.id } },
      },
    });

    return chat;
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
