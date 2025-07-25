import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DrizzleUserRepository } from '../infrastructure/repositories/drizzle-user.repository';
import { UserRepositoryInterface } from '../domain/repositories/user.repository.interface';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'UserRepositoryInterface',
      useClass: DrizzleUserRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}