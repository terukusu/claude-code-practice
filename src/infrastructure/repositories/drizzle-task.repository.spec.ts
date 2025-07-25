import { DrizzleTaskRepository } from './drizzle-task.repository';
import { TestDatabaseFactory } from '../persistence/drizzle/test-database.factory';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { TaskAggregate } from '../../domain/aggregates/task.aggregate';
import { Priority, PriorityEnum } from '../../domain/value-objects/priority.value-object';
import { TaskStatus } from '../../domain/value-objects/task-status.value-object';
import * as schema from '../persistence/drizzle/schema';

describe('DrizzleTaskRepository', () => {
  let repository: DrizzleTaskRepository;
  let db: BetterSQLite3Database<typeof schema>;

  beforeEach(async () => {
    db = TestDatabaseFactory.create();
    await TestDatabaseFactory.setupTestDatabase(db);
    repository = new DrizzleTaskRepository(db);

    // Create test users and project
    await db.insert(schema.users).values([
      {
        id: 'user-1',
        email: 'creator@example.com',
        name: 'Creator',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user-2',
        email: 'assignee@example.com',
        name: 'Assignee',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await db.insert(schema.projects).values({
      id: 'project-1',
      name: 'Test Project',
      description: 'Test Description',
      ownerId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterEach(() => {
    // Close connection if available (SQLite specific)
    if (db && (db as any).close) {
      (db as any).close();
    }
  });

  describe('Task Saving', () => {
    it('should save new task successfully', async () => {
      const task = new TaskAggregate(
        'task-1',
        'Test Task',
        'Test Description',
        'project-1',
        'user-1',
        Priority.HIGH(),
        new Date('2024-12-31'),
      );

      const savedTask = await repository.save(task);

      expect(savedTask.id).toBe('task-1');
      expect(savedTask.title).toBe('Test Task');
      expect(savedTask.description).toBe('Test Description');
      expect(savedTask.projectId).toBe('project-1');
      expect(savedTask.createdBy).toBe('user-1');
      expect(savedTask.priority.getValue()).toBe(PriorityEnum.HIGH);
    });

    it('should update existing task', async () => {
      const task = new TaskAggregate(
        'task-1',
        'Original Title',
        'Original Description',
        'project-1',
        'user-1',
      );

      await repository.save(task);

      // Update task
      task.updateDetails('Updated Title', 'Updated Description');
      task.changePriority(Priority.URGENT(), 'user-1');

      const updatedTask = await repository.save(task);

      expect(updatedTask.title).toBe('Updated Title');
      expect(updatedTask.description).toBe('Updated Description');
      expect(updatedTask.priority.getValue()).toBe(PriorityEnum.URGENT);
    });
  });

  describe('Task Retrieval', () => {
    let savedTask: TaskAggregate;

    beforeEach(async () => {
      const task = new TaskAggregate(
        'task-1',
        'Test Task',
        'Test Description',
        'project-1',
        'user-1',
        Priority.MEDIUM(),
        new Date('2024-12-31'),
      );
      task.assignTo('user-2', 'user-1');
      savedTask = await repository.save(task);
    });

    it('should find task by ID', async () => {
      const task = await repository.findById('task-1');

      expect(task).toBeDefined();
      expect(task!.id).toBe('task-1');
      expect(task!.title).toBe('Test Task');
      expect(task!.assigneeId).toBe('user-2');
      expect(task!.priority.getValue()).toBe(PriorityEnum.MEDIUM);
      expect(task!.status.getValue()).toBe('TODO');
    });

    it('should return null when task not found', async () => {
      const task = await repository.findById('non-existent');

      expect(task).toBeNull();
    });

    it('should find tasks by project ID', async () => {
      // Create another task in the same project
      const task2 = new TaskAggregate(
        'task-2',
        'Another Task',
        'Another Description',
        'project-1',
        'user-1',
      );
      await repository.save(task2);

      // Create task in different project
      await db.insert(schema.projects).values({
        id: 'project-2',
        name: 'Another Project',
        ownerId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const task3 = new TaskAggregate(
        'task-3',
        'Different Project Task',
        'Description',
        'project-2',
        'user-1',
      );
      await repository.save(task3);

      const projectTasks = await repository.findByProjectId('project-1');

      expect(projectTasks).toHaveLength(2);
      expect(projectTasks.map(t => t.id)).toContain('task-1');
      expect(projectTasks.map(t => t.id)).toContain('task-2');
      expect(projectTasks.map(t => t.id)).not.toContain('task-3');
    });

    it('should find tasks by assignee ID', async () => {
      // Create another task assigned to same user
      const task2 = new TaskAggregate(
        'task-2',
        'Another Task',
        'Description',
        'project-1',
        'user-1',
      );
      task2.assignTo('user-2', 'user-1');
      await repository.save(task2);

      // Create unassigned task
      const task3 = new TaskAggregate(
        'task-3',
        'Unassigned Task',
        'Description',
        'project-1',
        'user-1',
      );
      await repository.save(task3);

      const assignedTasks = await repository.findByAssigneeId('user-2');

      expect(assignedTasks).toHaveLength(2);
      expect(assignedTasks.map(t => t.id)).toContain('task-1');
      expect(assignedTasks.map(t => t.id)).toContain('task-2');
      expect(assignedTasks.map(t => t.id)).not.toContain('task-3');
    });
  });

  describe('Task Status Management', () => {
    it('should preserve task status transitions', async () => {
      const task = new TaskAggregate(
        'task-1',
        'Test Task',
        'Description',
        'project-1',
        'user-1',
      );

      // Change status through valid transitions
      task.changeStatus(TaskStatus.IN_PROGRESS(), 'user-1');
      await repository.save(task);

      const retrievedTask = await repository.findById('task-1');
      expect(retrievedTask!.status.getValue()).toBe('IN_PROGRESS');

      // Continue transition
      retrievedTask!.changeStatus(TaskStatus.REVIEW(), 'user-1');
      await repository.save(retrievedTask!);

      const finalTask = await repository.findById('task-1');
      expect(finalTask!.status.getValue()).toBe('REVIEW');
    });
  });

  describe('Task Deletion', () => {
    it('should delete task successfully', async () => {
      const task = new TaskAggregate(
        'task-1',
        'Test Task',
        'Description',
        'project-1',
        'user-1',
      );
      await repository.save(task);

      await repository.delete('task-1');

      const deletedTask = await repository.findById('task-1');
      expect(deletedTask).toBeNull();
    });
  });

  describe('Overdue Tasks', () => {
    it('should find overdue tasks', async () => {
      // Create overdue task
      const overdueTask = new TaskAggregate(
        'task-overdue',
        'Overdue Task',
        'Description',
        'project-1',
        'user-1',
        Priority.MEDIUM(),
        new Date('2020-01-01'), // Past date
      );
      await repository.save(overdueTask);

      // Create future task
      const futureTask = new TaskAggregate(
        'task-future',
        'Future Task',
        'Description',
        'project-1',
        'user-1',
        Priority.MEDIUM(),
        new Date('2030-01-01'), // Future date
      );
      await repository.save(futureTask);

      // Create completed overdue task (should not be included)
      const completedTask = new TaskAggregate(
        'task-completed',
        'Completed Task',
        'Description',
        'project-1',
        'user-1',
        Priority.MEDIUM(),
        new Date('2020-01-01'), // Past date
      );
      completedTask.changeStatus(TaskStatus.IN_PROGRESS(), 'user-1');
      completedTask.changeStatus(TaskStatus.REVIEW(), 'user-1');
      completedTask.changeStatus(TaskStatus.DONE(), 'user-1');
      await repository.save(completedTask);

      const overdueTasks = await repository.findOverdueTasks();

      expect(overdueTasks).toHaveLength(1);
      expect(overdueTasks[0].id).toBe('task-overdue');
    });
  });

  describe('Domain Events Handling', () => {
    it('should clear domain events after saving existing entity', async () => {
      const task = new TaskAggregate(
        'task-1',
        'Test Task',
        'Description',
        'project-1',
        'user-1',
      );

      await repository.save(task);

      // Retrieve task should have no domain events (cleared after mapping from DB)
      const retrievedTask = await repository.findById('task-1');
      expect(retrievedTask!.domainEvents).toHaveLength(0);
    });
  });
});