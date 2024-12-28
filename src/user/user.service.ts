import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    return await this.prismaService.user.create({
      data: {
        username: createUserDto.username,
        password: createUserDto.password,
      },
    });
  }

  async findAll() {
    return await this.prismaService.user.findMany({
      include: { Profile: true },
    });
  }

  async findOne(id: string) {
    return await this.prismaService.user.findUnique({
      where: { id: id },
      include: { Profile: true },
    });
  }

  async profile(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: id },
      include: { Profile: true },
    });
    delete user.password;
    return user;
  }

  async createProfile(id: string, createProfileDto: CreateProfileDto) {
    return await this.prismaService.profile.create({
      data: {
        ...createProfileDto,
        user: { connect: { id: id } },
      },
    });
  }

  async findOneByUsername(username: string) {
    return await this.prismaService.user.findUnique({
      where: { username: username },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.prismaService.user.update({
      where: { id: id },
      data: {
        username: updateUserDto.username,
        password: updateUserDto.password,
      },
    });
  }

  async remove(id: string) {
    return await this.prismaService.user.delete({
      where: { id: id },
    });
  }
}
