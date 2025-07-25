import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { TaskRepositoryInterface } from '../../domain/repositories/task.repository.interface';
import { TaskAggregate } from '../../domain/aggregates/task.aggregate';
import { TaskStatus, TaskStatusEnum } from '../../domain/value-objects/task-status.value-object';
import { Priority, PriorityEnum } from '../../domain/value-objects/priority.value-object';
import { DATABASE_CONNECTION } from '../persistence/drizzle/database.module';
import { tasks, Task } from '../persistence/drizzle/schema';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

@Injectable()
export class DrizzleTaskRepository implements TaskRepositoryInterface {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: BetterSQLite3Database<any>,
  ) {}

  async save(task: TaskAggregate): Promise<TaskAggregate> {
    const taskData = this.aggregateToRecord(task);
    
    await this.db
      .insert(tasks)
      .values(taskData)
      .onConflictDoUpdate({
        target: tasks.id,
        set: {
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          assigneeId: taskData.assigneeId,
          dueDate: taskData.dueDate,
          updatedAt: taskData.updatedAt,
        },
      });

    return task;
  }

  async findById(id: string): Promise<TaskAggregate | null> {
    const result = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.recordToAggregate(result[0]);
  }

  async findByProjectId(projectId: string): Promise<TaskAggregate[]> {
    const result = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(tasks.createdAt);

    return result.map(record => this.recordToAggregate(record));
  }

  async findByAssigneeId(assigneeId: string): Promise<TaskAggregate[]> {
    const result = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.assigneeId, assigneeId))
      .orderBy(tasks.createdAt);

    return result.map(record => this.recordToAggregate(record));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(tasks).where(eq(tasks.id, id));
  }

  async findOverdueTasks(): Promise<TaskAggregate[]> {
    const now = new Date();
    const result = await this.db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'DONE'),
          // Note: SQLite doesn't have direct date comparison, need to convert
        ),
      );

    return result
      .filter(record => {
        if (!record.dueDate) return false;
        return record.dueDate < now && record.status !== 'DONE';
      })
      .map(record => this.recordToAggregate(record));
  }

  private recordToAggregate(record: Task): TaskAggregate {
    const task = new (TaskAggregate as any)(
      record.id,
      record.title,
      record.description || '',
      record.projectId,
      record.createdBy,
      new Priority(record.priority as PriorityEnum),
      record.dueDate,
    );

    // Set status
    const status = new TaskStatus(record.status as TaskStatusEnum);
    (task as any)._status = status;

    // Set assignee if exists
    if (record.assigneeId) {
      (task as any)._assigneeId = record.assigneeId;
    }

    // Clear domain events for existing entities
    task.clearDomainEvents();

    return task;
  }

  private aggregateToRecord(aggregate: TaskAggregate): Omit<Task, 'createdAt'> & { createdAt?: Date } {
    return {
      id: aggregate.id,
      title: aggregate.title,
      description: aggregate.description,
      status: aggregate.status.getValue() as any,
      priority: aggregate.priority.getValue(),
      projectId: aggregate.projectId,
      assigneeId: aggregate.assigneeId,
      createdBy: aggregate.createdBy,
      dueDate: aggregate.dueDate,
      updatedAt: aggregate.updatedAt,
    };
  }
}