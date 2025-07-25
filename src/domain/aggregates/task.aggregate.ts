import { BaseEntity } from '../entities/base.entity';
import { TaskStatus, TaskStatusEnum } from '../value-objects/task-status.value-object';
import { Priority } from '../value-objects/priority.value-object';
import { DomainEvent } from '../events/domain-event.interface';
import {
  TaskCreatedEvent,
  TaskAssignedEvent,
  TaskStatusChangedEvent,
  TaskPriorityChangedEvent,
  TaskCompletedEvent,
} from '../events/task.events';

export class TaskAggregate extends BaseEntity<string> {
  private _title: string;
  private _description: string;
  private _status: TaskStatus;
  private _priority: Priority;
  private _assigneeId: string | null;
  private _projectId: string;
  private _dueDate: Date | null;
  private _createdBy: string;
  private _domainEvents: DomainEvent[] = [];

  constructor(
    id: string,
    title: string,
    description: string,
    projectId: string,
    createdBy: string,
    priority: Priority = Priority.MEDIUM(),
    dueDate: Date | null = null,
  ) {
    super(id);
    this._title = title;
    this._description = description;
    this._status = TaskStatus.TODO();
    this._priority = priority;
    this._assigneeId = null;
    this._projectId = projectId;
    this._dueDate = dueDate;
    this._createdBy = createdBy;

    this.addDomainEvent(
      new TaskCreatedEvent(id, projectId, title, createdBy),
    );
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get status(): TaskStatus {
    return this._status;
  }

  get priority(): Priority {
    return this._priority;
  }

  get assigneeId(): string | null {
    return this._assigneeId;
  }

  get projectId(): string {
    return this._projectId;
  }

  get dueDate(): Date | null {
    return this._dueDate;
  }

  get createdBy(): string {
    return this._createdBy;
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  assignTo(assigneeId: string, assignedBy: string): void {
    if (this._assigneeId === assigneeId) {
      return;
    }

    this._assigneeId = assigneeId;
    this.touch();

    this.addDomainEvent(
      new TaskAssignedEvent(this._id, assigneeId, assignedBy),
    );
  }

  changeStatus(newStatus: TaskStatus, changedBy: string): void {
    if (this._status.equals(newStatus)) {
      return;
    }

    if (!this._status.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from ${this._status} to ${newStatus}`,
      );
    }

    const oldStatus = this._status;
    this._status = newStatus;
    this.touch();

    this.addDomainEvent(
      new TaskStatusChangedEvent(this._id, oldStatus, newStatus, changedBy),
    );

    if (newStatus.equals(TaskStatus.DONE())) {
      this.addDomainEvent(
        new TaskCompletedEvent(this._id, changedBy, new Date()),
      );
    }
  }

  changePriority(newPriority: Priority, changedBy: string): void {
    if (this._priority.equals(newPriority)) {
      return;
    }

    const oldPriority = this._priority;
    this._priority = newPriority;
    this.touch();

    this.addDomainEvent(
      new TaskPriorityChangedEvent(this._id, oldPriority, newPriority, changedBy),
    );
  }

  updateDetails(title: string, description: string): void {
    this._title = title;
    this._description = description;
    this.touch();
  }

  setDueDate(dueDate: Date | null): void {
    this._dueDate = dueDate;
    this.touch();
  }

  isOverdue(): boolean {
    if (!this._dueDate) {
      return false;
    }

    return this._dueDate < new Date() && !this._status.equals(TaskStatus.DONE());
  }

  isAssigned(): boolean {
    return this._assigneeId !== null;
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
}