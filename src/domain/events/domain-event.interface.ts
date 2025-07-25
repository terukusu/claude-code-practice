export interface DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventVersion: number;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly eventVersion: number = 1;

  constructor() {
    this.eventId = this.generateEventId();
    this.occurredOn = new Date();
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}