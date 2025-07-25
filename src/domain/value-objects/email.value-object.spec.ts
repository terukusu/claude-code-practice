import { Email } from './email.value-object';

describe('Email Value Object', () => {
  describe('Valid Email Creation', () => {
    it('should create email with valid format', () => {
      const email = new Email('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = new Email('TEST@EXAMPLE.COM');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const email = new Email('  test@example.com  ');
      expect(email.getValue()).toBe('test@example.com');
    });
  });

  describe('Invalid Email Validation', () => {
    it('should throw error for empty email', () => {
      expect(() => new Email('')).toThrow('Email cannot be empty');
      expect(() => new Email('   ')).toThrow('Email cannot be empty');
    });

    it('should throw error for invalid format', () => {
      expect(() => new Email('invalid-email')).toThrow('Invalid email format');
      expect(() => new Email('test@')).toThrow('Invalid email format');
      expect(() => new Email('@example.com')).toThrow('Invalid email format');
      expect(() => new Email('test@domain')).toThrow('Invalid email format');
    });

    it('should throw error for too long email', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(() => new Email(longEmail)).toThrow('Email too long');
    });
  });

  describe('Email Comparison', () => {
    it('should return true for equal emails', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('TEST@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = new Email('test1@example.com');
      const email2 = new Email('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('String Representation', () => {
    it('should return email as string', () => {
      const email = new Email('test@example.com');
      expect(email.toString()).toBe('test@example.com');
    });
  });
});