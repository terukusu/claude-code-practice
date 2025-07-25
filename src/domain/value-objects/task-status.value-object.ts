export enum TaskStatusEnum {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

export class TaskStatus {
  private readonly value: TaskStatusEnum;

  constructor(value: TaskStatusEnum) {
    this.value = value;
  }

  static TODO(): TaskStatus {
    return new TaskStatus(TaskStatusEnum.TODO);
  }

  static IN_PROGRESS(): TaskStatus {
    return new TaskStatus(TaskStatusEnum.IN_PROGRESS);
  }

  static REVIEW(): TaskStatus {
    return new TaskStatus(TaskStatusEnum.REVIEW);
  }

  static DONE(): TaskStatus {
    return new TaskStatus(TaskStatusEnum.DONE);
  }

  getValue(): TaskStatusEnum {
    return this.value;
  }

  equals(other: TaskStatus): boolean {
    return this.value === other.value;
  }

  canTransitionTo(newStatus: TaskStatus): boolean {
    const transitions = {
      [TaskStatusEnum.TODO]: [TaskStatusEnum.IN_PROGRESS],
      [TaskStatusEnum.IN_PROGRESS]: [TaskStatusEnum.REVIEW, TaskStatusEnum.TODO],
      [TaskStatusEnum.REVIEW]: [TaskStatusEnum.DONE, TaskStatusEnum.IN_PROGRESS],
      [TaskStatusEnum.DONE]: [TaskStatusEnum.IN_PROGRESS],
    };

    return transitions[this.value]?.includes(newStatus.value) ?? false;
  }

  toString(): string {
    return this.value;
  }
}