import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World! Welcome to NestJS 🚀"', () => {
      expect(appController.getHello()).toBe('Hello World! Welcome to NestJS 🚀');
    });
  });

  describe('health', () => {
    it('should return health status object', () => {
      const health = appController.getHealth();
      expect(health).toHaveProperty('status', 'ok');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('uptime');
    });
  });

  describe('api/hello', () => {
    it('should return API hello object', () => {
      const apiHello = appController.getApiHello();
      expect(apiHello).toHaveProperty('message', 'Hello NestJS! 🎉');
      expect(apiHello).toHaveProperty('version', '1.0.0');
      expect(apiHello).toHaveProperty('timestamp');
    });
  });
});