import { ProjectAggregate } from '../aggregates/project.aggregate';

export interface ProjectRepositoryInterface {
  save(project: ProjectAggregate): Promise<ProjectAggregate>;
  findById(id: string): Promise<ProjectAggregate | null>;
  findByOwnerId(ownerId: string): Promise<ProjectAggregate[]>;
  findByMemberId(memberId: string): Promise<ProjectAggregate[]>;
  delete(id: string): Promise<void>;
  findActiveProjects(): Promise<ProjectAggregate[]>;
}