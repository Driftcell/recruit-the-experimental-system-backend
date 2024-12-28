import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';

@Injectable()
export class ConfigService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createConfigDto: CreateConfigDto) {
    return await this.prismaService.config.create({
      data: createConfigDto,
    });
  }

  async findAll() {
    return await this.prismaService.config.findMany();
  }

  async findOne(key: string) {
    return await this.prismaService.config.findUnique({
      where: { key: key },
    });
  }

  async update(key: string, updateConfigDto: UpdateConfigDto) {
    return await this.prismaService.config.update({
      where: { key: key },
      data: updateConfigDto,
    });
  }

  async remove(key: string) {
    return await this.prismaService.config.delete({
      where: { key: key },
    });
  }
}
