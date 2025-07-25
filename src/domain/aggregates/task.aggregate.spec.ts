import { TaskAggregate } from './task.aggregate';
import { TaskStatus } from '../value-objects/task-status.value-object';
import { Priority } from '../value-objects/priority.value-object';
import { 
  TaskCreatedEvent, 
  TaskAssignedEvent, 
  TaskStatusChangedEvent,
  TaskPriorityChangedEvent,
  TaskCompletedEvent 
} from '../events/task.events';

describe('TaskAggregate', () => {
  let task: TaskAggregate;
  const taskId = 'task-123';
  const projectId = 'project-456';
  const createdBy = 'user-789';

  beforeEach(() => {
    task = new TaskAggregate(
      taskId,
      'Test Task',
      'Test Description',
      projectId,
      createdBy,
      Priority.MEDIUM(),
    );
  });

  describe('Task Creation', () => {
    it('should create task with correct initial values', () => {
      expect(task.id).toBe(taskId);
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test Description');
      expect(task.projectId).toBe(projectId);
      expect(task.createdBy).toBe(createdBy);
      expect(task.status.equals(TaskStatus.TODO())).toBe(true);
      expect(task.priority.equals(Priority.MEDIUM())).toBe(true);
      expect(task.assigneeId).toBeNull();
    });

    it('should emit TaskCreatedEvent on creation', () => {
      const events = task.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(TaskCreatedEvent);
      
      const createdEvent = events[0] as TaskCreatedEvent;
      expect(createdEvent.taskId).toBe(taskId);
      expect(createdEvent.projectId).toBe(projectId);
      expect(createdEvent.title).toBe('Test Task');
      expect(createdEvent.createdBy).toBe(createdBy);
    });
  });

  describe('Task Assignment', () => {
    it('should assign task to user', () => {
      const assigneeId = 'user-assignee';
      const assignedBy = 'user-admin';

      task.assignTo(assigneeId, assignedBy);

      expect(task.assigneeId).toBe(assigneeId);
      
      const events = task.domainEvents;
      const assignedEvent = events.find(e => e instanceof TaskAssignedEvent) as TaskAssignedEvent;
      expect(assignedEvent).toBeDefined();
      expect(assignedEvent.taskId).toBe(taskId);
      expect(assignedEvent.assigneeId).toBe(assigneeId);
      expect(assignedEvent.assignedBy).toBe(assignedBy);
    });

    it('should not emit event when assigning to same user', () => {
      const assigneeId = 'user-assignee';
      const assignedBy = 'user-admin';

      task.assignTo(assigneeId, assignedBy);
      const eventsCountBefore = task.domainEvents.length;
      
      task.assignTo(assigneeId, assignedBy);
      const eventsCountAfter = task.domainEvents.length;

      expect(eventsCountAfter).toBe(eventsCountBefore);
    });

    it('should indicate when task is assigned', () => {
      expect(task.isAssigned()).toBe(false);
      
      task.assignTo('user-assignee', 'user-admin');
      
      expect(task.isAssigned()).toBe(true);
    });
  });

  describe('Status Changes', () => {
    it('should change status with valid transition', () => {
      const changedBy = 'user-admin';
      
      task.changeStatus(TaskStatus.IN_PROGRESS(), changedBy);
      
      expect(task.status.equals(TaskStatus.IN_PROGRESS())).toBe(true);
      
      const events = task.domainEvents;
      const statusEvent = events.find(e => e instanceof TaskStatusChangedEvent) as TaskStatusChangedEvent;
      expect(statusEvent).toBeDefined();
      expect(statusEvent.taskId).toBe(taskId);
      expect(statusEvent.oldStatus.equals(TaskStatus.TODO())).toBe(true);
      expect(statusEvent.newStatus.equals(TaskStatus.IN_PROGRESS())).toBe(true);
      expect(statusEvent.changedBy).toBe(changedBy);
    });

    it('should throw error for invalid transition', () => {
      expect(() => {
        task.changeStatus(TaskStatus.DONE(), 'user-admin');
      }).toThrow('Cannot transition from TODO to DONE');
    });

    it('should emit TaskCompletedEvent when task is completed', () => {
      const changedBy = 'user-admin';
      
      // First move to IN_PROGRESS, then REVIEW, then DONE
      task.changeStatus(TaskStatus.IN_PROGRESS(), changedBy);
      task.changeStatus(TaskStatus.REVIEW(), changedBy);
      task.changeStatus(TaskStatus.DONE(), changedBy);
      
      const events = task.domainEvents;
      const completedEvent = events.find(e => e instanceof TaskCompletedEvent) as TaskCompletedEvent;
      expect(completedEvent).toBeDefined();
      expect(completedEvent.taskId).toBe(taskId);
      expect(completedEvent.completedBy).toBe(changedBy);
    });

    it('should not emit event when changing to same status', () => {
      const eventsCountBefore = task.domainEvents.length;
      
      task.changeStatus(TaskStatus.TODO(), 'user-admin');
      
      expect(task.domainEvents.length).toBe(eventsCountBefore);
    });
  });

  describe('Priority Changes', () => {
    it('should change priority', () => {
      const changedBy = 'user-admin';
      const newPriority = Priority.HIGH();
      
      task.changePriority(newPriority, changedBy);
      
      expect(task.priority.equals(newPriority)).toBe(true);
      
      const events = task.domainEvents;
      const priorityEvent = events.find(e => e instanceof TaskPriorityChangedEvent) as TaskPriorityChangedEvent;
      expect(priorityEvent).toBeDefined();
      expect(priorityEvent.taskId).toBe(taskId);
      expect(priorityEvent.oldPriority.equals(Priority.MEDIUM())).toBe(true);
      expect(priorityEvent.newPriority.equals(newPriority)).toBe(true);
      expect(priorityEvent.changedBy).toBe(changedBy);
    });

    it('should not emit event when changing to same priority', () => {
      const eventsCountBefore = task.domainEvents.length;
      
      task.changePriority(Priority.MEDIUM(), 'user-admin');
      
      expect(task.domainEvents.length).toBe(eventsCountBefore);
    });
  });

  describe('Task Details Update', () => {
    it('should update title and description', () => {
      const newTitle = 'Updated Title';
      const newDescription = 'Updated Description';
      
      task.updateDetails(newTitle, newDescription);
      
      expect(task.title).toBe(newTitle);
      expect(task.description).toBe(newDescription);
    });
  });

  describe('Due Date Management', () => {
    it('should set due date', () => {
      const dueDate = new Date('2024-12-31');
      
      task.setDueDate(dueDate);
      
      expect(task.dueDate).toBe(dueDate);
    });

    it('should detect overdue tasks', () => {
      const pastDate = new Date('2020-01-01');
      
      task.setDueDate(pastDate);
      
      expect(task.isOverdue()).toBe(true);
    });

    it('should not consider completed tasks as overdue', () => {
      const pastDate = new Date('2020-01-01');
      
      task.setDueDate(pastDate);
      task.changeStatus(TaskStatus.IN_PROGRESS(), 'user');
      task.changeStatus(TaskStatus.REVIEW(), 'user');
      task.changeStatus(TaskStatus.DONE(), 'user');
      
      expect(task.isOverdue()).toBe(false);
    });

    it('should not consider tasks without due date as overdue', () => {
      expect(task.isOverdue()).toBe(false);
    });
  });

  describe('Domain Events Management', () => {
    it('should clear domain events', () => {
      expect(task.domainEvents.length).toBeGreaterThan(0);
      
      task.clearDomainEvents();
      
      expect(task.domainEvents).toHaveLength(0);
    });

    it('should return copy of domain events', () => {
      const events = task.domainEvents;
      events.push({} as any); // Try to modify returned array
      
      expect(task.domainEvents.length).toBe(1); // Original should be unchanged
    });
  });
});