import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(private readonly prismaService: PrismaService) {}

  async listProjects() {
    const res = await fetch(`${process.env.LABEL_STUDIO_URL}/api/projects`, {
      method: 'GET',
      headers: {
        Authorization: process.env.LABEL_STUDIO_KEY,
      },
    });
    const data = await res.json();

    const projects = [];
    for (const result of data.results) {
      projects.push({
        id: result.id,
        title: result.title,
      });
    }

    return projects;
  }

  async syncAll(projectId: number) {
    const chats = await this.prismaService.chat.findMany({
      where: {
        taskId: null,
      },
    });

    for (const chat of chats) {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: chat.userId,
        },
        include: {
          Profile: true,
        },
      });

      try {
        const messages = await this.prismaService.message.findMany({
          where: {
            chatId: chat.id,
          },
          orderBy: {
            createdAt: 'asc',
          },
        });

        if (messages.length === 0) {
          continue;
        }

        const task = messages.map((message) => {
          return {
            author:
              message.role === 'user'
                ? user.Profile.extra['name']
                : 'assistant',
            text: message.content,
          };
        });

        const extra = JSON.parse(user.Profile.extra.toString());
        let { diagnosedConditions, currentIssues, desiredChanges } = extra;
        diagnosedConditions = diagnosedConditions
          .map((condition: { label: string }) => condition.label)
          .join('、');
        currentIssues = currentIssues
          .map((condition: { label: string }) => condition.label)
          .join('、');
        desiredChanges = desiredChanges
          .map((condition: { label: string }) => condition.label)
          .join('、');
        delete extra.diagnosedConditions;
        delete extra.currentIssues;
        delete extra.desiredChanges;

        const information = Object.keys(extra)
          .map((key) => `${key}: ${extra[key]}`)
          .join('\n');

        task.unshift({
          author: 'system',
          text: information,
        });

        const res = await fetch(`${process.env.LABEL_STUDIO_URL}/api/tasks`, {
          method: 'POST',
          headers: {
            Authorization: process.env.LABEL_STUDIO_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            project: projectId,
            data: { humanMachineDialogue: task },
          }),
        });

        const data = await res.json();

        const createdTesk = await this.prismaService.task.create({
          data: {
            Chat: { connect: { id: chat.id } },
            projectId: projectId,
            taskId: data.id,
          },
        });

        await this.prismaService.chat.update({
          where: {
            id: chat.id,
          },
          data: {
            Task: { connect: { id: createdTesk.id } },
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
  }
}
