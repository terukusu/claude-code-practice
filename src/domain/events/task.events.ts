import { BaseDomainEvent } from './domain-event.interface';
import { TaskStatus } from '../value-objects/task-status.value-object';
import { Priority } from '../value-objects/priority.value-object';

export class TaskCreatedEvent extends BaseDomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly projectId: string,
    public readonly title: string,
    public readonly createdBy: string,
  ) {
    super();
  }
}

export class TaskAssignedEvent extends BaseDomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly assigneeId: string,
    public readonly assignedBy: string,
  ) {
    super();
  }
}

export class TaskStatusChangedEvent extends BaseDomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly oldStatus: TaskStatus,
    public readonly newStatus: TaskStatus,
    public readonly changedBy: string,
  ) {
    super();
  }
}

export class TaskPriorityChangedEvent extends BaseDomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly oldPriority: Priority,
    public readonly newPriority: Priority,
    public readonly changedBy: string,
  ) {
    super();
  }
}

export class TaskCompletedEvent extends BaseDomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly completedBy: string,
    public readonly completedAt: Date,
  ) {
    super();
  }
}