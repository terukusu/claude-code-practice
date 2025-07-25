import { TaskStatus, TaskStatusEnum } from './task-status.value-object';

describe('TaskStatus Value Object', () => {
  describe('Factory Methods', () => {
    it('should create TODO status', () => {
      const status = TaskStatus.TODO();
      expect(status.getValue()).toBe(TaskStatusEnum.TODO);
    });

    it('should create IN_PROGRESS status', () => {
      const status = TaskStatus.IN_PROGRESS();
      expect(status.getValue()).toBe(TaskStatusEnum.IN_PROGRESS);
    });

    it('should create REVIEW status', () => {
      const status = TaskStatus.REVIEW();
      expect(status.getValue()).toBe(TaskStatusEnum.REVIEW);
    });

    it('should create DONE status', () => {
      const status = TaskStatus.DONE();
      expect(status.getValue()).toBe(TaskStatusEnum.DONE);
    });
  });

  describe('Status Comparison', () => {
    it('should return true for equal statuses', () => {
      const status1 = TaskStatus.TODO();
      const status2 = TaskStatus.TODO();
      expect(status1.equals(status2)).toBe(true);
    });

    it('should return false for different statuses', () => {
      const status1 = TaskStatus.TODO();
      const status2 = TaskStatus.DONE();
      expect(status1.equals(status2)).toBe(false);
    });
  });

  describe('Status Transitions', () => {
    it('should allow valid transitions from TODO', () => {
      const todoStatus = TaskStatus.TODO();
      expect(todoStatus.canTransitionTo(TaskStatus.IN_PROGRESS())).toBe(true);
      expect(todoStatus.canTransitionTo(TaskStatus.REVIEW())).toBe(false);
      expect(todoStatus.canTransitionTo(TaskStatus.DONE())).toBe(false);
    });

    it('should allow valid transitions from IN_PROGRESS', () => {
      const inProgressStatus = TaskStatus.IN_PROGRESS();
      expect(inProgressStatus.canTransitionTo(TaskStatus.TODO())).toBe(true);
      expect(inProgressStatus.canTransitionTo(TaskStatus.REVIEW())).toBe(true);
      expect(inProgressStatus.canTransitionTo(TaskStatus.DONE())).toBe(false);
    });

    it('should allow valid transitions from REVIEW', () => {
      const reviewStatus = TaskStatus.REVIEW();
      expect(reviewStatus.canTransitionTo(TaskStatus.TODO())).toBe(false);
      expect(reviewStatus.canTransitionTo(TaskStatus.IN_PROGRESS())).toBe(true);
      expect(reviewStatus.canTransitionTo(TaskStatus.DONE())).toBe(true);
    });

    it('should allow valid transitions from DONE', () => {
      const doneStatus = TaskStatus.DONE();
      expect(doneStatus.canTransitionTo(TaskStatus.TODO())).toBe(false);
      expect(doneStatus.canTransitionTo(TaskStatus.IN_PROGRESS())).toBe(true);
      expect(doneStatus.canTransitionTo(TaskStatus.REVIEW())).toBe(false);
    });
  });

  describe('String Representation', () => {
    it('should return status as string', () => {
      expect(TaskStatus.TODO().toString()).toBe('TODO');
      expect(TaskStatus.IN_PROGRESS().toString()).toBe('IN_PROGRESS');
      expect(TaskStatus.REVIEW().toString()).toBe('REVIEW');
      expect(TaskStatus.DONE().toString()).toBe('DONE');
    });
  });
});