export interface UserRepositoryInterface {
  create(userData: {
    email: string;
    name: string;
    bio?: string;
  }): Promise<{
    id: string;
    email: string;
    name: string;
    bio: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  
  findById(id: string): Promise<{
    id: string;
    email: string;
    name: string;
    bio: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null>;
  
  findByEmail(email: string): Promise<{
    id: string;
    email: string;
    name: string;
    bio: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null>;
  
  findAll(): Promise<{
    id: string;
    email: string;
    name: string;
    bio: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[]>;
  
  update(id: string, userData: {
    name?: string;
    bio?: string;
    isActive?: boolean;
  }): Promise<{
    id: string;
    email: string;
    name: string;
    bio: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null>;
  
  delete(id: string): Promise<void>;
}