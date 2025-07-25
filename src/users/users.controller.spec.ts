import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUser = {
    id: 'user_123',
    email: 'test@example.com',
    name: 'Test User',
    bio: 'Test bio',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Test bio',
      };

      service.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should handle validation errors', async () => {
      const invalidDto = {
        email: 'invalid-email',
        name: '',
      } as CreateUserDto;

      service.create.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.create(invalidDto)).rejects.toThrow('Validation failed');
    });

    it('should create user without bio', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const userWithoutBio = { ...mockUser, bio: null };
      service.create.mockResolvedValue(userWithoutBio);

      const result = await controller.create(createUserDto);

      expect(result.bio).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 'user_456', email: 'another@example.com' }];
      service.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      service.findAll.mockRejectedValue(new Error('Database connection failed'));

      await expect(controller.findAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      service.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('user_123');

      expect(service.findOne).toHaveBeenCalledWith('user_123');
      expect(result).toEqual(mockUser);
    });

    it('should handle user not found', async () => {
      service.findOne.mockRejectedValue(new NotFoundException('User with ID nonexistent not found'));

      await expect(controller.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should handle invalid ID formats', async () => {
      service.findOne.mockRejectedValue(new NotFoundException('User with ID invalid-id not found'));

      await expect(controller.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        bio: 'Updated bio',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user_123', updateUserDto);

      expect(service.update).toHaveBeenCalledWith('user_123', updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should handle partial updates', async () => {
      const updateUserDto: UpdateUserDto = { name: 'New Name Only' };
      const updatedUser = { ...mockUser, name: 'New Name Only' };
      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user_123', updateUserDto);

      expect(result.name).toBe('New Name Only');
      expect(result.email).toBe(mockUser.email); // unchanged
    });

    it('should handle user not found during update', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      service.update.mockRejectedValue(new NotFoundException('User with ID nonexistent not found'));

      await expect(controller.update('nonexistent', updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should handle empty update payload', async () => {
      const emptyDto: UpdateUserDto = {};
      service.update.mockResolvedValue(mockUser);

      const result = await controller.update('user_123', emptyDto);

      expect(service.update).toHaveBeenCalledWith('user_123', emptyDto);
      expect(result).toEqual(mockUser);
    });

    it('should update isActive status', async () => {
      const updateUserDto: UpdateUserDto = { isActive: false };
      const updatedUser = { ...mockUser, isActive: false };
      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user_123', updateUserDto);

      expect(result.isActive).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('user_123');

      expect(service.remove).toHaveBeenCalledWith('user_123');
    });

    it('should handle user not found during removal', async () => {
      service.remove.mockRejectedValue(new NotFoundException('User with ID nonexistent not found'));

      await expect(controller.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should handle service errors during removal', async () => {
      service.remove.mockRejectedValue(new Error('Database transaction failed'));

      await expect(controller.remove('user_123')).rejects.toThrow('Database transaction failed');
    });
  });

  describe('integration scenarios', () => {
    it('should handle concurrent operations', async () => {
      const createDto: CreateUserDto = { email: 'concurrent@example.com', name: 'Concurrent User' };
      service.create.mockResolvedValue(mockUser);
      service.findAll.mockResolvedValue([mockUser]);

      const [createResult, findAllResult] = await Promise.all([
        controller.create(createDto),
        controller.findAll(),
      ]);

      expect(createResult).toEqual(mockUser);
      expect(findAllResult).toContain(mockUser);
    });

    it('should handle rapid successive updates', async () => {
      const update1: UpdateUserDto = { name: 'Name 1' };
      const update2: UpdateUserDto = { name: 'Name 2' };

      service.update
        .mockResolvedValueOnce({ ...mockUser, name: 'Name 1' })
        .mockResolvedValueOnce({ ...mockUser, name: 'Name 2' });

      const [result1, result2] = await Promise.all([
        controller.update('user_123', update1),
        controller.update('user_123', update2),
      ]);

      expect(result1.name).toBe('Name 1');
      expect(result2.name).toBe('Name 2');
    });
  });

  describe('error handling', () => {
    it('should propagate service exceptions', async () => {
      service.findOne.mockRejectedValue(new Error('Unexpected database error'));

      await expect(controller.findOne('user_123')).rejects.toThrow('Unexpected database error');
    });

    it('should handle malformed requests gracefully', async () => {
      const malformedDto = null as any;
      service.create.mockRejectedValue(new Error('Invalid input'));

      await expect(controller.create(malformedDto)).rejects.toThrow('Invalid input');
    });
  });
});