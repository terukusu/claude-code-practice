import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../persistence/drizzle/database.module';
import { users, User, NewUser } from '../persistence/drizzle/schema';
import { UserRepositoryInterface } from '../../domain/repositories/user.repository.interface';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

@Injectable()
export class DrizzleUserRepository implements UserRepositoryInterface {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: BetterSQLite3Database<any>,
  ) {}

  async create(userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = this.generateId();
    const newUser: NewUser = {
      ...userData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(users).values(newUser);
    
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0];
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async findAll(): Promise<User[]> {
    return await this.db
      .select()
      .from(users)
      .orderBy(users.createdAt);
  }

  async update(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    await this.db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}