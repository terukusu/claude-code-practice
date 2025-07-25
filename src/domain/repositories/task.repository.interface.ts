import { TaskAggregate } from '../aggregates/task.aggregate';

export interface TaskRepositoryInterface {
  save(task: TaskAggregate): Promise<TaskAggregate>;
  findById(id: string): Promise<TaskAggregate | null>;
  findByProjectId(projectId: string): Promise<TaskAggregate[]>;
  findByAssigneeId(assigneeId: string): Promise<TaskAggregate[]>;
  delete(id: string): Promise<void>;
  findOverdueTasks(): Promise<TaskAggregate[]>;
}