import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import axios from 'axios';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({ cors: true, namespace: 'chat' }) // 启用跨域支持
export class ChatGateway {
  constructor(private readonly prismaService: PrismaService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('insertMessage')
  async insertMessage(
    @MessageBody() data: { chatId: string; message: string; role: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId, message, role } = data;
    if (!chatId || !message || !role) {
      client.emit('error', { message: 'chatId/role/message are required' });
      return;
    }

    await this.prismaService.message.create({
      data: {
        chatId,
        content: message,
        role,
      },
    });
  }

  @SubscribeMessage('startChat')
  async handleChat(
    @MessageBody() data: { chatId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId, message } = data;

    if (!chatId || !message) {
      client.emit('error', { message: 'chatId and message are required' });
      return;
    }

    // 从数据库中获取聊天记录
    const messages = await this.prismaService.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const history_chat = messages
      .filter((m) => m.role !== 'tool')
      .map((m) => m.content);

    console.log(history_chat);

    let answer = '';
    let tools = [];
    try {
      // 转发请求到上游 SSE 服务器
      const sseUrl = process.env.MODEL_SERVER_URL;
      const response = await axios({
        method: 'post',
        url: sseUrl,
        headers: { 'Content-Type': 'application/json' },
        data: {
          query: message,
          history_chat,
          latest_passive_recognization: 20,
        },
        responseType: 'stream',
      });

      // 监听 SSE 数据流并转发给客户端
      response.data.on('data', (chunk: Buffer) => {
        try {
          // 将 Buffer 转为字符串并去掉前缀 "data: "
          const rawMessage = chunk.toString();
          if (rawMessage.startsWith('data:')) {
            const jsonData = rawMessage.slice(5).trim(); // 去掉前缀并移除多余空格
            const parsedData = JSON.parse(jsonData); // 解析为 JSON

            console.log(parsedData);

            // 转发解析后的数据给客户端
            if (
              parsedData.mode === 1 ||
              (parsedData.mode === 2 && parsedData.tool_list.length === 0)
            ) {
              client.emit('chatUpdate', {
                chatId,
                data: {
                  delta: parsedData.model_answer,
                },
              });
              answer += parsedData.model_answer;
            }
            if (
              parsedData.mode === 3 ||
              (parsedData.mode === 2 && parsedData.tool_list.length !== 0)
            ) {
              tools = parsedData.tool_list;
              client.emit('toolSuggestion', {
                chatId,
                data: {
                  tools: parsedData.tool_list,
                },
              });
            }
          } else {
            console.warn('Unexpected message format:', rawMessage);
          }
        } catch (err) {
          console.error('Error parsing SSE chunk:', err.message);
        }
      });
      // 监听 SSE 完成事件
      response.data.on('end', async () => {
        // 保存聊天记录到数据库
        await this.prismaService.message.create({
          data: {
            chatId,
            content: message,
            role: 'user',
          },
        });
        if (tools.length !== 0 && answer.length === 0) {
          await this.prismaService.message.create({
            data: {
              chatId,
              content: JSON.stringify(tools),
              role: 'tool',
            },
          });
          await this.prismaService.message.create({
            data: {
              chatId,
              content: `已为您推荐以下工具：${tools.join('、')}。`,
              role: 'assistant',
            },
          });
        }
        if (answer.length !== 0) {
          await this.prismaService.message.create({
            data: {
              chatId,
              content: answer,
              role: 'assistant',
            },
          });
        }
        client.emit('chatComplete', { chatId });
      });

      // 监听 SSE 错误
      response.data.on('error', (err: Error) => {
        client.emit('error', { chatId, message: err.message });
      });
    } catch (error) {
      client.emit('error', { chatId, message: error.message });
    }
  }
}
