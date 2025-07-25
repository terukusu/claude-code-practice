import { PriorityEnum } from '../../domain/value-objects/priority.value-object';

export class CreateTaskCommand {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly projectId: string,
    public readonly createdBy: string,
    public readonly priority: PriorityEnum = PriorityEnum.MEDIUM,
    public readonly dueDate: Date | null = null,
    public readonly assigneeId: string | null = null,
  ) {}
}