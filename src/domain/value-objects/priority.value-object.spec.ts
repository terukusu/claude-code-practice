import { Priority, PriorityEnum } from './priority.value-object';

describe('Priority Value Object', () => {
  describe('Factory Methods', () => {
    it('should create LOW priority', () => {
      const priority = Priority.LOW();
      expect(priority.getValue()).toBe(PriorityEnum.LOW);
      expect(priority.getLabel()).toBe('Low');
    });

    it('should create MEDIUM priority', () => {
      const priority = Priority.MEDIUM();
      expect(priority.getValue()).toBe(PriorityEnum.MEDIUM);
      expect(priority.getLabel()).toBe('Medium');
    });

    it('should create HIGH priority', () => {
      const priority = Priority.HIGH();
      expect(priority.getValue()).toBe(PriorityEnum.HIGH);
      expect(priority.getLabel()).toBe('High');
    });

    it('should create URGENT priority', () => {
      const priority = Priority.URGENT();
      expect(priority.getValue()).toBe(PriorityEnum.URGENT);
      expect(priority.getLabel()).toBe('Urgent');
    });
  });

  describe('Priority Comparison', () => {
    it('should return true for equal priorities', () => {
      const priority1 = Priority.HIGH();
      const priority2 = Priority.HIGH();
      expect(priority1.equals(priority2)).toBe(true);
    });

    it('should return false for different priorities', () => {
      const priority1 = Priority.LOW();
      const priority2 = Priority.HIGH();
      expect(priority1.equals(priority2)).toBe(false);
    });
  });

  describe('Priority Hierarchy', () => {
    it('should correctly compare priority levels', () => {
      const low = Priority.LOW();
      const medium = Priority.MEDIUM();
      const high = Priority.HIGH();
      const urgent = Priority.URGENT();

      expect(medium.isHigherThan(low)).toBe(true);
      expect(high.isHigherThan(medium)).toBe(true);
      expect(urgent.isHigherThan(high)).toBe(true);
      
      expect(low.isHigherThan(medium)).toBe(false);
      expect(medium.isHigherThan(high)).toBe(false);
      expect(high.isHigherThan(urgent)).toBe(false);
    });

    it('should return false for equal priorities comparison', () => {
      const priority1 = Priority.MEDIUM();
      const priority2 = Priority.MEDIUM();
      expect(priority1.isHigherThan(priority2)).toBe(false);
    });
  });

  describe('String Representation', () => {
    it('should return priority label as string', () => {
      expect(Priority.LOW().toString()).toBe('Low');
      expect(Priority.MEDIUM().toString()).toBe('Medium');
      expect(Priority.HIGH().toString()).toBe('High');
      expect(Priority.URGENT().toString()).toBe('Urgent');
    });
  });
});