import { DrizzleUserRepository } from './drizzle-user.repository';
import { TestDatabaseFactory } from '../persistence/drizzle/test-database.factory';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../persistence/drizzle/schema';

describe('DrizzleUserRepository', () => {
  let repository: DrizzleUserRepository;
  let db: BetterSQLite3Database<typeof schema>;

  beforeEach(async () => {
    db = TestDatabaseFactory.create();
    await TestDatabaseFactory.setupTestDatabase(db);
    repository = new DrizzleUserRepository(db);
  });

  afterEach(() => {
    // Close connection if available (SQLite specific)
    if (db && (db as any).close) {
      (db as any).close();
    }
  });

  describe('User Creation', () => {
    it('should create user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Test bio',
      };

      const user = await repository.create(userData);

      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.bio).toBe(userData.bio);
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for multiple users', async () => {
      const user1 = await repository.create({
        email: 'user1@example.com',
        name: 'User 1',
      });

      const user2 = await repository.create({
        email: 'user2@example.com',
        name: 'User 2',
      });

      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('User Retrieval', () => {
    let createdUser: any;

    beforeEach(async () => {
      createdUser = await repository.create({
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Test bio',
      });
    });

    it('should find user by ID', async () => {
      const user = await repository.findById(createdUser.id);

      expect(user).toBeDefined();
      expect(user!.id).toBe(createdUser.id);
      expect(user!.email).toBe(createdUser.email);
    });

    it('should return null when user not found by ID', async () => {
      const user = await repository.findById('non-existent-id');

      expect(user).toBeNull();
    });

    it('should find user by email', async () => {
      const user = await repository.findByEmail(createdUser.email);

      expect(user).toBeDefined();
      expect(user!.id).toBe(createdUser.id);
      expect(user!.email).toBe(createdUser.email);
    });

    it('should return null when user not found by email', async () => {
      const user = await repository.findByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });

    it('should find all users', async () => {
      await repository.create({
        email: 'user2@example.com',
        name: 'User 2',
      });

      const users = await repository.findAll();

      expect(users).toHaveLength(2);
      expect(users.map(u => u.email)).toContain('test@example.com');
      expect(users.map(u => u.email)).toContain('user2@example.com');
    });
  });

  describe('User Update', () => {
    let createdUser: any;

    beforeEach(async () => {
      createdUser = await repository.create({
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Original bio',
      });
    });

    it('should update user successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        bio: 'Updated bio',
        isActive: false,
      };

      const updatedUser = await repository.update(createdUser.id, updateData);

      expect(updatedUser).toBeDefined();
      expect(updatedUser!.name).toBe(updateData.name);
      expect(updatedUser!.bio).toBe(updateData.bio);
      expect(updatedUser!.isActive).toBe(updateData.isActive);
      expect(updatedUser!.email).toBe(createdUser.email); // Should remain unchanged
      expect(updatedUser!.updatedAt.getTime()).toBeGreaterThan(createdUser.updatedAt.getTime());
    });

    it('should return null when updating non-existent user', async () => {
      const updatedUser = await repository.update('non-existent-id', {
        name: 'Updated Name',
      });

      expect(updatedUser).toBeNull();
    });

    it('should update only provided fields', async () => {
      const updateData = { name: 'Updated Name Only' };

      const updatedUser = await repository.update(createdUser.id, updateData);

      expect(updatedUser!.name).toBe(updateData.name);
      expect(updatedUser!.bio).toBe(createdUser.bio); // Should remain unchanged
      expect(updatedUser!.email).toBe(createdUser.email); // Should remain unchanged
    });
  });

  describe('User Deletion', () => {
    let createdUser: any;

    beforeEach(async () => {
      createdUser = await repository.create({
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should delete user successfully', async () => {
      await repository.delete(createdUser.id);

      const user = await repository.findById(createdUser.id);
      expect(user).toBeNull();
    });

    it('should not throw error when deleting non-existent user', async () => {
      await expect(repository.delete('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('Email Uniqueness', () => {
    it('should enforce email uniqueness', async () => {
      await repository.create({
        email: 'unique@example.com',
        name: 'User 1',
      });

      // This should fail due to unique constraint
      await expect(
        repository.create({
          email: 'unique@example.com',
          name: 'User 2',
        })
      ).rejects.toThrow();
    });
  });
});