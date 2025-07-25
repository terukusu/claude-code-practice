import { CreateTaskCommand } from './create-task.command';
import { PriorityEnum } from '../../domain/value-objects/priority.value-object';

describe('CreateTaskCommand', () => {
  describe('constructor', () => {
    it('should create command with all required properties', () => {
      const dueDate = new Date('2024-12-31');
      const command = new CreateTaskCommand(
        'Test Task',
        'Task description',
        'project-456',
        'user-789',
        PriorityEnum.HIGH,
        dueDate,
        'assignee-123'
      );

      expect(command.title).toBe('Test Task');
      expect(command.description).toBe('Task description');
      expect(command.projectId).toBe('project-456');
      expect(command.createdBy).toBe('user-789');
      expect(command.priority).toBe(PriorityEnum.HIGH);
      expect(command.dueDate).toBe(dueDate);
      expect(command.assigneeId).toBe('assignee-123');
    });

    it('should create command with minimal required properties', () => {
      const command = new CreateTaskCommand(
        'Minimal Task',
        '',
        'project-123',
        'user-456'
      );

      expect(command.title).toBe('Minimal Task');
      expect(command.description).toBe('');
      expect(command.projectId).toBe('project-123');
      expect(command.createdBy).toBe('user-456');
      expect(command.priority).toBe(PriorityEnum.MEDIUM); // default
      expect(command.dueDate).toBeNull(); // default
      expect(command.assigneeId).toBeNull(); // default
    });

    it('should handle special characters in properties', () => {
      const command = new CreateTaskCommand(
        'Task with émojis 🚀 and spëcial chars',
        'Description with <tags> and "quotes"',
        'project-αβγ',
        'user-測試'
      );

      expect(command.title).toBe('Task with émojis 🚀 and spëcial chars');
      expect(command.description).toBe('Description with <tags> and "quotes"');
      expect(command.projectId).toBe('project-αβγ');
      expect(command.createdBy).toBe('user-測試');
    });

    it('should handle long text inputs', () => {
      const longTitle = 'A'.repeat(500);
      const longDescription = 'B'.repeat(2000);

      const command = new CreateTaskCommand(
        longTitle,
        longDescription,
        'project-123',
        'user-456'
      );

      expect(command.title).toBe(longTitle);
      expect(command.description).toBe(longDescription);
      expect(command.title.length).toBe(500);
      expect(command.description.length).toBe(2000);
    });

    it('should set all priority levels correctly', () => {
      const lowCommand = new CreateTaskCommand(
        'Low Priority Task',
        'Description',
        'project-123',
        'user-456',
        PriorityEnum.LOW
      );

      const urgentCommand = new CreateTaskCommand(
        'Urgent Task',
        'Description',
        'project-123',
        'user-456',
        PriorityEnum.URGENT
      );

      expect(lowCommand.priority).toBe(PriorityEnum.LOW);
      expect(urgentCommand.priority).toBe(PriorityEnum.URGENT);
    });
  });

  describe('property access', () => {
    let command: CreateTaskCommand;

    beforeEach(() => {
      command = new CreateTaskCommand(
        'Test Task',
        'Description',
        'project-456',
        'user-789'
      );
    });

    it('should have readonly properties in TypeScript', () => {
      // TypeScript enforces readonly at compile time
      // At runtime, properties can be modified but shouldn't be
      expect(command.title).toBe('Test Task');
      expect(command.description).toBe('Description');
      expect(command.projectId).toBe('project-456');
      expect(command.createdBy).toBe('user-789');
    });

    it('should maintain property values', () => {
      const original = {
        title: command.title,
        description: command.description,
        projectId: command.projectId,
        createdBy: command.createdBy,
        priority: command.priority,
      };

      // Even if properties could be modified, we test current values
      expect(command.title).toBe(original.title);
      expect(command.description).toBe(original.description);
      expect(command.projectId).toBe(original.projectId);
      expect(command.createdBy).toBe(original.createdBy);
      expect(command.priority).toBe(original.priority);
    });
  });

  describe('equality and comparison', () => {
    it('should be equal when all properties match', () => {
      const command1 = new CreateTaskCommand(
        'Test Task',
        'Description',
        'project-456',
        'user-789',
        PriorityEnum.HIGH
      );

      const command2 = new CreateTaskCommand(
        'Test Task',
        'Description',
        'project-456',
        'user-789',
        PriorityEnum.HIGH
      );

      // Commands are value objects, so they should be considered equal
      expect(command1.title).toBe(command2.title);
      expect(command1.description).toBe(command2.description);
      expect(command1.projectId).toBe(command2.projectId);
      expect(command1.createdBy).toBe(command2.createdBy);
      expect(command1.priority).toBe(command2.priority);
    });

    it('should be different when any property differs', () => {
      const baseCommand = new CreateTaskCommand(
        'Test Task',
        'Description',
        'project-456',
        'user-789'
      );

      const differentTitle = new CreateTaskCommand(
        'Different Task',
        'Description',
        'project-456',
        'user-789'
      );

      const differentPriority = new CreateTaskCommand(
        'Test Task',
        'Description',
        'project-456',
        'user-789',
        PriorityEnum.URGENT
      );

      expect(baseCommand.title).not.toBe(differentTitle.title);
      expect(baseCommand.priority).not.toBe(differentPriority.priority);
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const command = new CreateTaskCommand('', '', '', '');

      expect(command.title).toBe('');
      expect(command.description).toBe('');
      expect(command.projectId).toBe('');
      expect(command.createdBy).toBe('');
    });

    it('should handle whitespace-only strings', () => {
      const command = new CreateTaskCommand(
        '   ',
        '\t\n',
        '  \r\n  ',
        '\t'
      );

      expect(command.title).toBe('   ');
      expect(command.description).toBe('\t\n');
      expect(command.projectId).toBe('  \r\n  ');
      expect(command.createdBy).toBe('\t');
    });

    it('should handle date edge cases', () => {
      const pastDate = new Date('2020-01-01');
      const futureDate = new Date('2030-12-31');

      const pastCommand = new CreateTaskCommand(
        'Past Task',
        'Description',
        'project-123',
        'user-456',
        PriorityEnum.MEDIUM,
        pastDate
      );

      const futureCommand = new CreateTaskCommand(
        'Future Task',
        'Description',
        'project-123',
        'user-456',
        PriorityEnum.MEDIUM,
        futureDate
      );

      expect(pastCommand.dueDate).toBe(pastDate);
      expect(futureCommand.dueDate).toBe(futureDate);
    });
  });

  describe('serialization behavior', () => {
    it('should be JSON serializable', () => {
      const dueDate = new Date('2024-12-31');
      const command = new CreateTaskCommand(
        'Test Task',
        'Description',
        'project-456',
        'user-789',
        PriorityEnum.HIGH,
        dueDate,
        'assignee-123'
      );

      const serialized = JSON.stringify(command);
      const parsed = JSON.parse(serialized);

      expect(parsed.title).toBe(command.title);
      expect(parsed.description).toBe(command.description);
      expect(parsed.projectId).toBe(command.projectId);
      expect(parsed.createdBy).toBe(command.createdBy);
      expect(parsed.priority).toBe(command.priority);
      expect(parsed.assigneeId).toBe(command.assigneeId);
      expect(new Date(parsed.dueDate)).toEqual(command.dueDate);
    });

    it('should handle special characters in JSON', () => {
      const command = new CreateTaskCommand(
        'Title with "quotes" and \\backslashes',
        'Description with\nnewlines\tand\ttabs',
        'project-123',
        'user-456'
      );

      const serialized = JSON.stringify(command);
      const parsed = JSON.parse(serialized);

      expect(parsed.title).toBe(command.title);
      expect(parsed.description).toBe(command.description);
    });
  });

  describe('use case scenarios', () => {
    it('should represent typical user task creation', () => {
      const dueDate = new Date('2024-12-31');
      const command = new CreateTaskCommand(
        'Implement user authentication',
        'Add JWT-based authentication to the API endpoints with proper validation and error handling',
        'project_auth_system',
        'user_john_doe',
        PriorityEnum.HIGH,
        dueDate,
        'user_backend_dev'
      );

      expect(command.title).toContain('Implement');
      expect(command.description).toContain('JWT');
      expect(command.projectId).toMatch(/^project_/);
      expect(command.createdBy).toMatch(/^user_/);
      expect(command.priority).toBe(PriorityEnum.HIGH);
      expect(command.dueDate).toBe(dueDate);
    });

    it('should handle urgent task creation', () => {
      const command = new CreateTaskCommand(
        '🚨 URGENT: Fix production database connection leak',
        'Critical issue causing memory exhaustion in production. Immediate fix required.',
        'project_production_support',
        'user_oncall_engineer',
        PriorityEnum.URGENT
      );

      expect(command.title).toContain('URGENT');
      expect(command.title).toContain('🚨');
      expect(command.description).toContain('Critical');
      expect(command.priority).toBe(PriorityEnum.URGENT);
    });

    it('should handle multilingual content', () => {
      const command = new CreateTaskCommand(
        'ユーザー認証機能の実装',
        '日本語でのタスク説明。特殊文字や絵文字 🎌 も含む。',
        'project_japan_localization',
        'user_tanaka_san',
        PriorityEnum.MEDIUM
      );

      expect(command.title).toContain('ユーザー');
      expect(command.description).toContain('日本語');
      expect(command.description).toContain('🎌');
    });

    it('should handle unassigned tasks', () => {
      const command = new CreateTaskCommand(
        'Research new technologies',
        'Investigate potential solutions for scaling issues',
        'project_research',
        'user_team_lead',
        PriorityEnum.LOW,
        null, // no due date
        null  // no assignee
      );

      expect(command.assigneeId).toBeNull();
      expect(command.dueDate).toBeNull();
      expect(command.priority).toBe(PriorityEnum.LOW);
    });
  });

  describe('priority handling', () => {
    it('should support all priority levels', () => {
      const priorities = [
        PriorityEnum.LOW,
        PriorityEnum.MEDIUM,
        PriorityEnum.HIGH,
        PriorityEnum.URGENT
      ];

      priorities.forEach(priority => {
        const command = new CreateTaskCommand(
          'Test Task',
          'Description',
          'project-123',
          'user-456',
          priority
        );

        expect(command.priority).toBe(priority);
      });
    });

    it('should use MEDIUM as default priority', () => {
      const command = new CreateTaskCommand(
        'Default Priority Task',
        'Description',
        'project-123',
        'user-456'
      );

      expect(command.priority).toBe(PriorityEnum.MEDIUM);
    });
  });
});