import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async createRole(data: {
    name: string;
    displayName: string;
    description?: string;
    permissions: Record<string, string[]>;
  }) {
    return this.prisma.adminRole.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        permissions: data.permissions,
      },
    });
  }

  async getRoles() {
    return this.prisma.adminRole.findMany({
      where: { isActive: true },
      include: {
        adminUsers: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });
  }

  async updateRole(roleId: string, data: Partial<{
    displayName: string;
    description: string;
    permissions: Record<string, string[]>;
    isActive: boolean;
  }>) {
    return this.prisma.adminRole.update({
      where: { id: roleId },
      data,
    });
  }

  async assignRole(userId: string, roleId: string, department?: string) {
    const role = await this.prisma.adminRole.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

    const existing = await this.prisma.adminUser.findUnique({
      where: { userId },
    });

    if (existing) {
      return this.prisma.adminUser.update({
        where: { userId },
        data: { roleId, department },
      });
    }

    return this.prisma.adminUser.create({
      data: { userId, roleId, department },
    });
  }

  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const adminUser = await this.prisma.adminUser.findUnique({
      where: { userId },
      include: { role: true },
    });

    if (!adminUser || !adminUser.isActive) return false;

    const permissions = adminUser.role.permissions as Record<string, string[]>;
    const resourcePermissions = permissions[resource] || [];
    
    return resourcePermissions.includes(action) || resourcePermissions.includes('*');
  }

  async requirePermission(userId: string, resource: string, action: string) {
    const hasPermission = await this.checkPermission(userId, resource, action);
    if (!hasPermission) {
      throw new ForbiddenException(`Insufficient permissions: ${resource}:${action}`);
    }
  }

  async getUserPermissions(userId: string) {
    const adminUser = await this.prisma.adminUser.findUnique({
      where: { userId },
      include: { role: true },
    });

    if (!adminUser) return null;

    return {
      role: adminUser.role.name,
      displayName: adminUser.role.displayName,
      permissions: adminUser.role.permissions,
      department: adminUser.department,
    };
  }
}
