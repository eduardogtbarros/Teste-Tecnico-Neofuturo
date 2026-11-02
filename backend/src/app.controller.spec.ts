import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { DatabaseService } from './database/database.service';

describe('AppController', () => {
  let appController: AppController;

  const mockDatabase = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    mockDatabase.query.mockResolvedValue({
      rows: [{ current_time: '2026-11-02T12:00:00' }],
    });

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: DatabaseService,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('deve retornar o status de conexão com o banco de dados', async () => {
    const result = await appController.testDatabase();

    expect(result.connected).toBe(true);
    expect(result.time).toBe('2026-11-02T12:00:00');
    expect(mockDatabase.query).toHaveBeenCalledWith(
      'SELECT NOW() AS current_time',
    );
  });
});
