import { PrismaService } from '@ecommerce/database';
import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async list(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count()
    ]);
    return { data, total };
  }

  update(id: string, data: { firstName?: string; lastName?: string; role?: Role }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
