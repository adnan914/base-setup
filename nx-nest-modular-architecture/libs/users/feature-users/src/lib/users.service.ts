import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, In, Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import * as bcrypt from "bcryptjs";
import { AuditLog, Role, RoleModulePermission, User } from "@lib/core/database";
import { AuditActor, applyAuditActorSnapshotFallback, buildAuditChanges, pickAuditSnapshot, RES_MESSAGES, Status, UserRole, S3Service } from "@lib/core/common";
// import { CreateUserDto } from './dto/create-user.dto';
import {
  ADMIN_ROLE_NAMES,
  AdminRoleName,
  AdminListQueryDto,
  CreateAdminDto,
  UpdateAdminDto,
} from "./dto/admin-management.dto";
import { AuditLogListQueryDto } from "./dto/audit-log.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(AuditLog) private auditLogRepository: Repository<AuditLog>,
    private readonly s3Service: S3Service,
  ) {}

  // async create(createUserDto: CreateUserDto): Promise<User> {
  //   const { email, password, roleId } = createUserDto;

  //   // Check if user already exists
  //   const existingUser = await this.userRepository.findOne({ where: { email } });
  //   if (existingUser) {
  //     throw new ConflictException('');
  //   }

  //   // Hash password
  //   const hashedPassword = await bcrypt.hash(password, 12);

  //   // Create user
  //   const user = this.userRepository.create({
  //     ...createUserDto,
  //     password: hashedPassword,
  //     status: Status.ACTIVE,
  //     role: { id: roleId },
  //   });

  //   return this.userRepository.save(user);
  // }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async listAdmins(query: AdminListQueryDto, actor?: AuditActor) {
    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.min(Math.max(query.limit ?? 10, 1), 100);
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'updated_at';
    const sortOrder = query.sortOrder ?? 'DESC';

    const allowedRoles = this.getAllowedAdminRolesForActor(actor);

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .distinct(true)
      .where('role.name IN (:...adminRoles)', { adminRoles: allowedRoles });

    if (query.search?.trim()) {
      const search = `%${query.search.trim()}%`;
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('user.name ILIKE :search', { search })
            .orWhere('user.email ILIKE :search', { search })
            .orWhere('user.phone ILIKE :search', { search })
            .orWhere('role.name ILIKE :search', { search });
        }),
      );
    }

    if (query.role && allowedRoles.includes(query.role)) {
      qb.andWhere('role.name = :role', { role: query.role });
    }

    if (query.status) {
      qb.andWhere('user.status = :status', { status: query.status });
    }

    if (sortBy === 'role') {
      qb.orderBy('role.name', sortOrder);
    } else {
      qb.orderBy(`user.${sortBy}`, sortOrder);
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((user) => this.serializeAdmin(user)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAdminOptions(actor?: AuditActor) {
    const allowedRoles = this.getAllowedAdminRolesForActor(actor);
    const roles = await this.roleRepository.find({
      where: { name: In(allowedRoles) },
      order: { name: 'ASC' },
    });
    const rolesByName = new Map(roles.map((role) => [role.name, role]));

    return {
      roles: allowedRoles.map((roleName) => ({
        value: roleName,
        label: this.getAdminRoleLabel(roleName),
        id: rolesByName.get(roleName)?.id ?? null,
      })),
      statuses: [Status.ACTIVE, Status.INACTIVE, Status.BLOCKED].map((status) => ({
        value: status,
        label: this.getStatusLabel(status),
      })),
      institutes: [],
    };
  }

  async listAuditLogs(query: AuditLogListQueryDto) {
    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.min(Math.max(query.limit ?? 10, 1), 100);
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'created_at';
    const sortOrder = query.sortOrder ?? 'DESC';

    const qb = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.module = :module', { module: 'SUPER_ADMIN' });

    if (query.search?.trim()) {
      const search = `%${query.search.trim()}%`;
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('audit.message ILIKE :search', { search })
            .orWhere('audit.entity_type ILIKE :search', { search })
            .orWhere('audit.action ILIKE :search', { search })
            .orWhere('audit.performed_by_email ILIKE :search', { search });
        }),
      );
    }

    if (query.module?.trim()) {
      qb.andWhere('audit.module = :module', { module: query.module.trim() });
    }

    if (query.action?.trim()) {
      qb.andWhere('audit.action = :action', { action: query.action.trim() });
    }

    if (query.entityType?.trim()) {
      qb.andWhere('audit.entity_type = :entityType', { entityType: query.entityType.trim() });
    }

    if (query.serviceName?.trim()) {
      qb.andWhere('audit.service_name = :serviceName', { serviceName: query.serviceName.trim() });
    }

    qb.orderBy(`audit.${sortBy}`, sortOrder).skip(skip).take(limit);
    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((item) => ({
        id: item.id,
        serviceName: item.service_name,
        module: item.module,
        entityType: item.entity_type,
        entityId: item.entity_id,
        action: item.action,
        message: item.message,
        actorEmail: item.performed_by_email,
        actorRole: item.performed_by_role,
        ipAddress: item.ip_address,
        createdAt: item.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAuditLogById(id: string) {
    const item = await this.auditLogRepository.findOne({
      where: { id, module: 'SUPER_ADMIN' },
    });
    if (!item) {
      throw new NotFoundException(RES_MESSAGES.NOT_FOUND);
    }

    return {
      id: item.id,
      serviceName: item.service_name,
      module: item.module,
      entityType: item.entity_type,
      entityId: item.entity_id,
      action: item.action,
      message: item.message,
      actorEmail: item.performed_by_email,
      actorRole: item.performed_by_role,
      ipAddress: item.ip_address,
      userAgent: item.user_agent,
      targetSnapshot: await this.resolveActorReferences(item.target_snapshot_jsonb, item.performed_by_email),
      changes: await this.resolveChangeActorReferences(item.changes_jsonb, item.performed_by_email),
      meta: item.meta_jsonb,
      createdAt: item.created_at,
    };
  }

  async findAdminById(id: string, actor?: AuditActor) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user || !user.role || !this.isAdminRole(user.role.name) || !this.canManageAdminRole(actor, user.role.name)) {
      throw new NotFoundException(RES_MESSAGES.ADMIN_NOT_FOUND);
    }

    return this.serializeAdmin(user);
  }

  async createAdmin(dto: CreateAdminDto, actor?: AuditActor) {
    this.assertAdminRoleAllowedForActor(actor, dto.roleName);

    const existingUser = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email: dto.email.trim() })
      .getOne();

    if (existingUser) {
      throw new ConflictException(RES_MESSAGES.ADMIN_EMAIL_ALREADY_EXISTS);
    }

    const role = await this.resolveAdminRole(dto.roleName);
    const user = this.userRepository.create({
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone.trim(),
      password: await bcrypt.hash(dto.password, 12),
      role,
      status: dto.status ?? Status.ACTIVE,
      last_login_at: null as unknown as Date,
      created_by: actor?.id ?? null,
      updated_by: actor?.id ?? null,
    });

    const savedUser = await this.userRepository.save(user);
    await this.logAdminAudit({
      action: 'CREATE',
      entityId: savedUser.id,
      actor,
      message: `Admin ${savedUser.name} created`,
      snapshot: this.getAdminSnapshot(savedUser, role.name),
    });
    return this.findAdminById(savedUser.id, actor);
  }

  async updateAdmin(id: string, dto: UpdateAdminDto, actor?: AuditActor) {
    if (Object.prototype.hasOwnProperty.call(dto as Record<string, unknown>, 'email')) {
      throw new BadRequestException('Admin email cannot be updated.');
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user || !user.role || !this.isAdminRole(user.role.name) || !this.canManageAdminRole(actor, user.role.name)) {
      throw new NotFoundException(RES_MESSAGES.ADMIN_NOT_FOUND);
    }
    const before = this.getAdminSnapshot(user, user.role.name);

    if (dto.name?.trim()) {
      user.name = dto.name.trim();
    }

    if (typeof dto.phone === 'string') {
      user.phone = dto.phone.trim();
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 12);
    }

    if (dto.roleName) {
      this.assertAdminRoleAllowedForActor(actor, dto.roleName);
      user.role = await this.resolveAdminRole(dto.roleName);
    }

    if (dto.status) {
      user.status = dto.status;
    }
    user.updated_by = actor?.id ?? null;

    await this.userRepository.save(user);
    await this.logAdminAudit({
      action: 'UPDATE',
      entityId: user.id,
      actor,
      message: `Admin ${user.name} updated`,
      snapshot: this.getAdminSnapshot(user, user.role.name),
      changes: buildAuditChanges(before, this.getAdminSnapshot(user, user.role.name)),
    });
    return this.findAdminById(id, actor);
  }

  async removeAdmin(id: string, actor?: AuditActor): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user || !user.role || !this.isAdminRole(user.role.name) || !this.canManageAdminRole(actor, user.role.name)) {
      throw new NotFoundException(RES_MESSAGES.ADMIN_NOT_FOUND);
    }

    await this.logAdminAudit({
      action: 'DELETE',
      entityId: user.id,
      actor,
      message: `Admin ${user.name} deleted`,
      snapshot: this.getAdminSnapshot(user, user.role.name),
    });

    await this.userRepository.delete(id);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'role.permissions', 'role.permissions.module'],
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ["role", "role.permissions.module"],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { password, ...updateData } = updateUserDto;

    // Hash password if provided
    if (password) {
      updateData["password"] = await bcrypt.hash(password, 12);
    }

    await this.userRepository.update(id, updateData as QueryDeepPartialEntity<User>);

    const user = await this.findById(id);

    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException("User not found");
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { last_login_at: new Date() });
  }

  async getMyProfile(id: string) {
    const user = await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .leftJoinAndSelect("role.permissions", "permissions")
      .leftJoinAndSelect("permissions.module", "module")
      .where("user.id = :id", { id })
      .getOne();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return await this.serializeProfile(user);
  }

  async updateMyProfile(
    id: string,
    dto: UpdateProfileDto,
    profileImage?: { buffer: Buffer; mimetype: string; originalname: string } | null,
  ) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["role"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (typeof dto.name === "string" && dto.name.trim()) {
      user.name = dto.name.trim();
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 12);
    }

    if (profileImage) {
      // Key format: profile/role_name/user_id/file_name.png
      const roleName = user.role?.name?.toLowerCase() || 'user';
      const fileName = profileImage.originalname || `profile_${Date.now()}.png`;
      const s3Key = `profile/${roleName}/${id}/${fileName}`;
      
      user.profile_image_url = await this.s3Service.uploadFile(
        s3Key,
        profileImage.buffer,
        profileImage.mimetype
      );
    }

    await this.userRepository.save(user);

    return await this.getMyProfile(id);
  }

  private async serializeProfile(user: User) {
    let profileImageUrl = user.profile_image_url ?? null;
    
    // If it's an S3 key (not a data URL and not a full URL), get a presigned URL
    if (profileImageUrl && !profileImageUrl.startsWith('data:') && !profileImageUrl.startsWith('http')) {
      profileImageUrl = await this.s3Service.getPresignedUrl(profileImageUrl);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.name ?? null,
      permissions: (user.role?.permissions ?? [])
        .filter((permission: RoleModulePermission) => permission.access_allowed)
        .map((permission: RoleModulePermission) => ({
          id: permission.id,
          module: permission.module?.name ?? null,
        })),
      profileImageUrl,
    };
  }

  private isAdminRole(roleName?: string | null): roleName is AdminRoleName {
    return !!roleName && ADMIN_ROLE_NAMES.includes(roleName as AdminRoleName);
  }

  private getAllowedAdminRolesForActor(actor?: AuditActor): AdminRoleName[] {
    if (!actor?.role || actor.role === UserRole.SUPER_ADMIN) {
      return [...ADMIN_ROLE_NAMES];
    }

    return ADMIN_ROLE_NAMES.filter((roleName) => roleName === AdminRoleName.ADMIN);
  }

  private canManageAdminRole(actor: AuditActor | undefined, roleName: AdminRoleName) {
    return this.getAllowedAdminRolesForActor(actor).includes(roleName);
  }

  private assertAdminRoleAllowedForActor(actor: AuditActor | undefined, roleName: AdminRoleName) {
    if (!this.canManageAdminRole(actor, roleName)) {
      throw new ForbiddenException('You are not allowed to manage this admin role from the current module.');
    }
  }

  private async resolveAdminRole(roleName: AdminRoleName) {
    if (!this.isAdminRole(roleName)) {
      throw new NotFoundException(RES_MESSAGES.ADMIN_ROLE_INVALID);
    }

    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException(RES_MESSAGES.ADMIN_ROLE_INVALID);
    }

    return role;
  }

  private getAdminRoleLabel(roleName: string) {
    switch (roleName) {
      case UserRole.SUPER_ADMIN:
        return 'Super Admin';
      case UserRole.PLATFORM_ADMIN:
        return 'Platform Admin';
      case UserRole.SUPPORT_ADMIN:
        return 'Support Admin';
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.USER:
        return 'User';
      default:
        return roleName.replace(/_/g, ' ');
    }
  }

  private getStatusLabel(status: Status) {
    switch (status) {
      case Status.ACTIVE:
        return 'Active';
      case Status.INACTIVE:
        return 'Inactive';
      case Status.BLOCKED:
        return 'Blocked';
      default:
        return status;
    }
  }

  private serializeAdmin(user: User & { role?: Role | null }) {
    const roleName = user.role?.name ?? null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      roleName,
      roleLabel: roleName ? this.getAdminRoleLabel(roleName) : 'N/A',
      instituteId: null,
      instituteName: null,
      instituteIds: [],
      institutes: [],
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at ?? null,
    };
  }

  private getAdminSnapshot(user: User, roleName?: string | null) {
    return {
      ...pickAuditSnapshot(user as unknown as Record<string, unknown>, [
        'name',
        'email',
        'phone',
        'status',
        'created_by',
        'updated_by',
      ]),
      roleName: roleName ?? null,
      institutes: [],
    };
  }

  private async logAdminAudit(args: {
    action: string;
    entityId: string;
    actor?: AuditActor;
    message: string;
    snapshot?: Record<string, unknown> | null;
    changes?: Record<string, unknown> | null;
  }) {
    await this.auditLogRepository.save({
      service_name: 'user-service',
      module: 'SUPER_ADMIN',
      entity_type: 'ADMIN',
      entity_id: args.entityId,
      action: args.action,
      message: args.message,
      performed_by_user_id: args.actor?.id ?? null,
      performed_by_email: args.actor?.email ?? null,
      performed_by_role: args.actor?.role ?? null,
      target_snapshot_jsonb: applyAuditActorSnapshotFallback(args.snapshot, args.actor),
      changes_jsonb: args.changes ?? null,
      ip_address: args.actor?.ipAddress ?? null,
      user_agent: args.actor?.userAgent ?? null,
    });
  }

  private async resolveActorReferences(payload: Record<string, unknown> | null, actorEmail?: string | null) {
    if (!payload) return null;

    const actorIds = ['created_by', 'updated_by']
      .map((key) => payload[key])
      .filter((value): value is string => typeof value === 'string' && value.length > 0);

    if (actorIds.length === 0) {
      return payload;
    }

    const users = await this.userRepository.find({
      where: { id: In(actorIds) },
      select: ['id', 'email'],
    });
    const emailById = new Map(users.map((user) => [user.id, user.email]));

    return Object.entries(payload).reduce<Record<string, unknown>>((acc, [key, value]) => {
      if ((key === 'created_by' || key === 'updated_by') && typeof value === 'string') {
        acc[key] = emailById.get(value) ?? actorEmail ?? value;
      } else if ((key === 'created_by' || key === 'updated_by') && (value == null || value === '')) {
        acc[key] = actorEmail ?? null;
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  private async resolveChangeActorReferences(payload: Record<string, unknown> | null, actorEmail?: string | null) {
    if (!payload) return null;

    const actorIds = Object.entries(payload).flatMap((entry) => {
      const [key, value] = entry;
      if ((key !== 'created_by' && key !== 'updated_by') || typeof value !== 'object' || value == null) {
        return [];
      }

      const change = value as { before?: unknown; after?: unknown };
      return [change.before, change.after].filter(
        (candidate): candidate is string => typeof candidate === 'string' && candidate.length > 0,
      );
    });

    if (actorIds.length === 0) {
      return payload;
    }

    const users = await this.userRepository.find({
      where: { id: In(actorIds) },
      select: ['id', 'email'],
    });
    const emailById = new Map(users.map((user) => [user.id, user.email]));

    return Object.entries(payload).reduce<Record<string, unknown>>((acc, [key, value]) => {
      if ((key === 'created_by' || key === 'updated_by') && typeof value === 'object' && value != null) {
        const change = value as { before?: unknown; after?: unknown };
        acc[key] = {
          before:
            typeof change.before === 'string'
              ? (emailById.get(change.before) ?? actorEmail ?? change.before)
              : change.before ?? actorEmail ?? null,
          after:
            typeof change.after === 'string'
              ? (emailById.get(change.after) ?? actorEmail ?? change.after)
              : change.after ?? actorEmail ?? null,
        };
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
  }
}
