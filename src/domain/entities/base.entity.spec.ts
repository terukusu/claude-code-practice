import { BaseEntity } from './base.entity';

class TestEntity extends BaseEntity<string> {
  constructor(id: string) {
    super(id);
  }

  // Public method to test protected touch method
  public updateTimestamp(): void {
    this.touch();
  }
}

describe('BaseEntity', () => {
  let entity: TestEntity;
  const testId = 'test-entity-123';

  beforeEach(() => {
    entity = new TestEntity(testId);
  });

  describe('constructor', () => {
    it('should create entity with provided ID', () => {
      expect(entity.id).toBe(testId);
    });

    it('should set createdAt to current date', () => {
      const before = new Date();
      const newEntity = new TestEntity('new-id');
      const after = new Date();

      expect(newEntity.createdAt).toBeInstanceOf(Date);
      expect(newEntity.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(newEntity.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should set updatedAt to same as createdAt initially', () => {
      expect(entity.updatedAt).toEqual(entity.createdAt);
    });

    it('should handle different ID types', () => {
      class NumericEntity extends BaseEntity<number> {
        constructor(id: number) {
          super(id);
        }
      }

      const numericEntity = new NumericEntity(123);
      expect(numericEntity.id).toBe(123);
      expect(typeof numericEntity.id).toBe('number');
    });
  });

  describe('equals', () => {
    it('should return true for entities with same ID', () => {
      const other = new TestEntity(testId);
      expect(entity.equals(other)).toBe(true);
    });

    it('should return false for entities with different IDs', () => {
      const other = new TestEntity('different-id');
      expect(entity.equals(other)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(entity.equals(null as any)).toBe(false);
      expect(entity.equals(undefined as any)).toBe(false);
    });

    it('should return false for entities of different types', () => {
      class DifferentEntity extends BaseEntity<string> {
        constructor(id: string) {
          super(id);
        }
      }

      const differentEntity = new DifferentEntity(testId);
      expect(entity.equals(differentEntity as any)).toBe(false);
    });

    it('should handle complex ID types', () => {
      interface ComplexId {
        tenantId: string;
        entityId: string;
      }

      class ComplexEntity extends BaseEntity<ComplexId> {
        constructor(id: ComplexId) {
          super(id);
        }
      }

      const complexId: ComplexId = { tenantId: 'tenant1', entityId: 'entity1' };
      const entity1 = new ComplexEntity(complexId);
      const entity2 = new ComplexEntity(complexId);
      const entity3 = new ComplexEntity({ tenantId: 'tenant1', entityId: 'entity2' });

      expect(entity1.equals(entity2)).toBe(true);
      expect(entity1.equals(entity3)).toBe(false);
    });
  });

  describe('touch', () => {
    it('should update updatedAt timestamp', async () => {
      const originalUpdatedAt = entity.updatedAt;
      
      // Wait a small amount to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));
      
      entity.updateTimestamp();

      expect(entity.updatedAt).toBeInstanceOf(Date);
      expect(entity.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not affect createdAt', () => {
      const originalCreatedAt = entity.createdAt;
      
      entity.updateTimestamp();

      expect(entity.createdAt).toEqual(originalCreatedAt);
    });

    it('should work multiple times', async () => {
      const timestamps: Date[] = [entity.updatedAt];

      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 2)); // Slightly longer delay
        entity.updateTimestamp();
        timestamps.push(entity.updatedAt);
      }

      // Each timestamp should be greater than or equal to the previous one
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i].getTime()).toBeGreaterThanOrEqual(timestamps[i - 1].getTime());
      }
    });
  });

  describe('immutability', () => {
    it('should protect ID from modification', () => {
      // Attempting to set a property with only a getter should throw
      expect(() => {
        (entity as any).id = 'modified-id';
      }).toThrow();
    });

    it('should protect createdAt from modification', () => {
      // Attempting to set a property with only a getter should throw
      expect(() => {
        (entity as any).createdAt = new Date();
      }).toThrow();
    });

    it('should maintain original values after attempted modifications', () => {
      const originalId = entity.id;
      const originalCreatedAt = entity.createdAt;

      try {
        (entity as any).id = 'modified-id';
      } catch (e) {
        // Expected to throw
      }

      try {
        (entity as any).createdAt = new Date();
      } catch (e) {
        // Expected to throw
      }

      // Values should remain unchanged
      expect(entity.id).toBe(originalId);
      expect(entity.createdAt).toEqual(originalCreatedAt);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string ID', () => {
      const emptyEntity = new TestEntity('');
      expect(emptyEntity.id).toBe('');
      expect(emptyEntity.createdAt).toBeInstanceOf(Date);
    });

    it('should handle special characters in ID', () => {
      const specialId = 'test-entity-!@#$%^&*()_+-=[]{}|;:,.<>?';
      const specialEntity = new TestEntity(specialId);
      expect(specialEntity.id).toBe(specialId);
    });

    it('should handle very long IDs', () => {
      const longId = 'a'.repeat(1000);
      const longEntity = new TestEntity(longId);
      expect(longEntity.id).toBe(longId);
    });

    it('should maintain equality with same ID regardless of creation time', async () => {
      const entity1 = new TestEntity(testId);
      
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const entity2 = new TestEntity(testId);

      expect(entity1.equals(entity2)).toBe(true);
      expect(entity1.createdAt).not.toEqual(entity2.createdAt);
    });
  });

  describe('inheritance', () => {
    it('should work correctly with inherited classes', () => {
      class ExtendedEntity extends TestEntity {
        public readonly additionalProperty: string;

        constructor(id: string, additionalProperty: string) {
          super(id);
          this.additionalProperty = additionalProperty;
        }
      }

      const extended = new ExtendedEntity(testId, 'additional-value');
      const regular = new TestEntity(testId);

      expect(extended.id).toBe(testId);
      expect(extended.additionalProperty).toBe('additional-value');
      expect(extended.equals(regular)).toBe(false); // Different constructors, so not equal
    });
  });
});