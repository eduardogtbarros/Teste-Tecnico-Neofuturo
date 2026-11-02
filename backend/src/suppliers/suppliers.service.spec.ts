import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersService } from './suppliers.service';
import { DatabaseService } from '../database/database.service';

describe('SuppliersService', () => {
  let service: SuppliersService;

  const mockDatabase = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        {
          provide: DatabaseService,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve cadastrar um fornecedor e retornar o registro criado', async () => {
      const dto = {
        name: 'Fornecedor A',
        email: 'fornecedor@email.com',
        phone: '21999999999',
        category: 'Informática',
      };

      const fornecedorCriado = {
        id: 1,
        ...dto,
        created_at: new Date(),
      };

      mockDatabase.query.mockResolvedValue({
        rows: [fornecedorCriado],
      });

      const resultado = await service.create(dto);

      expect(resultado).toEqual(fornecedorCriado);

      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO suppliers'),
        ['Fornecedor A', 'fornecedor@email.com', '21999999999', 'Informática'],
      );
    });

    it('deve utilizar null quando telefone e categoria não forem informados', async () => {
      const dto = {
        name: 'Fornecedor B',
        email: 'b@email.com',
      };

      mockDatabase.query.mockResolvedValue({
        rows: [{ id: 2, ...dto }],
      });

      await service.create(dto);

      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO suppliers'),
        ['Fornecedor B', 'b@email.com', null, null],
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os fornecedores', async () => {
      const fornecedores = [
        { id: 1, name: 'Fornecedor A', email: 'a@email.com' },
        { id: 2, name: 'Fornecedor B', email: 'b@email.com' },
      ];

      mockDatabase.query.mockResolvedValue({
        rows: fornecedores,
      });

      const resultado = await service.findAll();

      expect(resultado).toEqual(fornecedores);
      expect(mockDatabase.query).toHaveBeenCalledTimes(1);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, name, email, phone, category'),
      );
    });

    it('deve retornar uma lista vazia quando não houver fornecedores', async () => {
      mockDatabase.query.mockResolvedValue({
        rows: [],
      });

      const resultado = await service.findAll();

      expect(resultado).toEqual([]);
    });
  });
});