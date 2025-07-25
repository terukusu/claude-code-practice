export enum PriorityEnum {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4,
}

export class Priority {
  private readonly value: PriorityEnum;

  constructor(value: PriorityEnum) {
    this.value = value;
  }

  static LOW(): Priority {
    return new Priority(PriorityEnum.LOW);
  }

  static MEDIUM(): Priority {
    return new Priority(PriorityEnum.MEDIUM);
  }

  static HIGH(): Priority {
    return new Priority(PriorityEnum.HIGH);
  }

  static URGENT(): Priority {
    return new Priority(PriorityEnum.URGENT);
  }

  getValue(): PriorityEnum {
    return this.value;
  }

  getLabel(): string {
    const labels = {
      [PriorityEnum.LOW]: 'Low',
      [PriorityEnum.MEDIUM]: 'Medium',
      [PriorityEnum.HIGH]: 'High',
      [PriorityEnum.URGENT]: 'Urgent',
    };
    return labels[this.value];
  }

  equals(other: Priority): boolean {
    return this.value === other.value;
  }

  isHigherThan(other: Priority): boolean {
    return this.value > other.value;
  }

  toString(): string {
    return this.getLabel();
  }
}