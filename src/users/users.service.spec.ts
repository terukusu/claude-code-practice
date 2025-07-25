import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRepositoryInterface } from '../domain/repositories/user.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: jest.Mocked<UserRepositoryInterface>;

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
    const mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'UserRepositoryInterface',
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mockRepository = module.get('UserRepositoryInterface');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Test bio',
      };

      mockRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should handle repository errors', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
      };

      mockRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createUserDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 'user_456', email: 'another@example.com' }];
      mockRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findOne('user_123');

      expect(mockRepository.findById).toHaveBeenCalledWith('user_123');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        new NotFoundException('User with ID nonexistent not found')
      );
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        bio: 'Updated bio',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update('user_123', updateUserDto);

      expect(mockRepository.update).toHaveBeenCalledWith('user_123', updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user to update not found', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      mockRepository.update.mockResolvedValue(null);

      await expect(service.update('nonexistent', updateUserDto)).rejects.toThrow(
        new NotFoundException('User with ID nonexistent not found')
      );
    });

    it('should handle partial updates', async () => {
      const updateUserDto: UpdateUserDto = { isActive: false };
      const updatedUser = { ...mockUser, isActive: false };
      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update('user_123', updateUserDto);

      expect(result.isActive).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.remove('user_123');

      expect(mockRepository.findById).toHaveBeenCalledWith('user_123');
      expect(mockRepository.delete).toHaveBeenCalledWith('user_123');
    });

    it('should throw NotFoundException when user to remove not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        new NotFoundException('User with ID nonexistent not found')
      );

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(mockRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });

    it('should handle invalid email formats gracefully', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('invalid-email');

      expect(mockRepository.findByEmail).toHaveBeenCalledWith('invalid-email');
      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string IDs', async () => {
      await expect(service.findOne('')).rejects.toThrow(NotFoundException);
    });

    it('should handle null repository responses', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('test')).rejects.toThrow(NotFoundException);
    });

    it('should handle repository connection failures', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('Connection failed'));

      await expect(service.findAll()).rejects.toThrow('Connection failed');
    });
  });
});