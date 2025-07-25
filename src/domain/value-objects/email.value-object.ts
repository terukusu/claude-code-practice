export class Email {
  private readonly value: string;

  constructor(value: string) {
    const trimmedValue = value?.trim() || '';
    this.validate(trimmedValue);
    this.value = trimmedValue.toLowerCase();
  }

  private validate(value: string): void {
    if (!value || value.length === 0) {
      throw new Error('Email cannot be empty');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }

    if (value.length > 255) {
      throw new Error('Email too long');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}