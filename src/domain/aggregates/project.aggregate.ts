import { BaseEntity } from '../entities/base.entity';
import { DomainEvent } from '../events/domain-event.interface';

export enum ProjectMemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export interface ProjectMember {
  userId: string;
  role: ProjectMemberRole;
  joinedAt: Date;
}

export class ProjectAggregate extends BaseEntity<string> {
  private _name: string;
  private _description: string;
  private _ownerId: string;
  private _members: Map<string, ProjectMember> = new Map();
  private _isActive: boolean = true;
  private _domainEvents: DomainEvent[] = [];

  constructor(
    id: string,
    name: string,
    description: string,
    ownerId: string,
  ) {
    super(id);
    this._name = name;
    this._description = description;
    this._ownerId = ownerId;

    // オーナーをメンバーとして追加
    this._members.set(ownerId, {
      userId: ownerId,
      role: ProjectMemberRole.OWNER,
      joinedAt: new Date(),
    });
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  get members(): ProjectMember[] {
    return Array.from(this._members.values());
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  addMember(userId: string, role: ProjectMemberRole, addedBy: string): void {
    if (this._members.has(userId)) {
      throw new Error('User is already a member of this project');
    }

    if (!this.canManageMembers(addedBy)) {
      throw new Error('Insufficient permissions to add members');
    }

    this._members.set(userId, {
      userId,
      role,
      joinedAt: new Date(),
    });

    this.touch();
  }

  removeMember(userId: string, removedBy: string): void {
    if (!this._members.has(userId)) {
      throw new Error('User is not a member of this project');
    }

    if (userId === this._ownerId) {
      throw new Error('Cannot remove project owner');
    }

    if (!this.canManageMembers(removedBy)) {
      throw new Error('Insufficient permissions to remove members');
    }

    this._members.delete(userId);
    this.touch();
  }

  updateMemberRole(userId: string, newRole: ProjectMemberRole, updatedBy: string): void {
    const member = this._members.get(userId);
    if (!member) {
      throw new Error('User is not a member of this project');
    }

    if (userId === this._ownerId) {
      throw new Error('Cannot change owner role');
    }

    if (!this.canManageMembers(updatedBy)) {
      throw new Error('Insufficient permissions to update member roles');
    }

    this._members.set(userId, { ...member, role: newRole });
    this.touch();
  }

  updateDetails(name: string, description: string, updatedBy: string): void {
    if (!this.canManageProject(updatedBy)) {
      throw new Error('Insufficient permissions to update project');
    }

    this._name = name;
    this._description = description;
    this.touch();
  }

  deactivate(deactivatedBy: string): void {
    if (!this.canManageProject(deactivatedBy)) {
      throw new Error('Insufficient permissions to deactivate project');
    }

    this._isActive = false;
    this.touch();
  }

  activate(activatedBy: string): void {
    if (!this.canManageProject(activatedBy)) {
      throw new Error('Insufficient permissions to activate project');
    }

    this._isActive = true;
    this.touch();
  }

  isMember(userId: string): boolean {
    return this._members.has(userId);
  }

  getMemberRole(userId: string): ProjectMemberRole | null {
    const member = this._members.get(userId);
    return member ? member.role : null;
  }

  canManageProject(userId: string): boolean {
    const role = this.getMemberRole(userId);
    return role === ProjectMemberRole.OWNER || role === ProjectMemberRole.ADMIN;
  }

  canManageMembers(userId: string): boolean {
    return this.canManageProject(userId);
  }

  canCreateTasks(userId: string): boolean {
    const role = this.getMemberRole(userId);
    return role !== ProjectMemberRole.VIEWER && role !== null;
  }

  canViewProject(userId: string): boolean {
    return this.isMember(userId);
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
}