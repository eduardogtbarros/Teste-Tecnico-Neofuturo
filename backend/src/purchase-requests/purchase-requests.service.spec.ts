import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  InternalServerErrorException,
  HttpException,
  GatewayTimeoutException,
} from '@nestjs/common';
import {
  RateLimitError,
  APIConnectionTimeoutError,
} from 'openai';
import { PurchaseRequestsService } from './purchase-requests.service';
import { DatabaseService } from '../database/database.service';

describe('PurchaseRequestsService', () => {
  let service: PurchaseRequestsService;

  const mockDatabase = {
    query: jest.fn(),
  };

  const mockOpenAI = {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  };

  const mockPurchaseRequest = {
    id: 1,
    item_name: 'Notebook',
    quantity: 2,
    justification: 'Substituição de equipamentos antigos',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseRequestsService,
        {
          provide: DatabaseService,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<PurchaseRequestsService>(
      PurchaseRequestsService,
    );

    jest.clearAllMocks();

    jest.spyOn(
      service as any,
      'createOpenAIClient',
    ).mockReturnValue(mockOpenAI);
  });

  describe('create', () => {
    it('deve criar uma solicitação de compra', async () => {
      const dto = {
        item_name: 'Notebook',
        quantity: 2,
        supplier_id: 1,
        requester_name: 'João',
        justification: 'Substituição de equipamentos antigos',
      };

      const solicitacaoCriada = {
        id: 1,
        ...dto,
        status: 'pending',
        created_at: new Date(),
      };

      mockDatabase.query.mockResolvedValue({
        rows: [solicitacaoCriada],
      });

      const resultado = await service.create(dto);

      expect(resultado).toEqual(solicitacaoCriada);

      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO purchase_requests'),
        [
          'Notebook',
          2,
          1,
          'João',
          'Substituição de equipamentos antigos',
        ],
      );
    });

    it('deve utilizar null quando fornecedor ou justificativa não forem informados', async () => {
      const dto = {
        item_name: 'Mouse',
        quantity: 5,
        requester_name: 'Maria',
      };

      mockDatabase.query.mockResolvedValue({
        rows: [{ id: 2, ...dto }],
      });

      await service.create(dto);

      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO purchase_requests'),
        ['Mouse', 5, null, 'Maria', null],
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar solicitações, total e total de pendentes', async () => {
      const solicitacoes = [
        { id: 1, item_name: 'Notebook', status: 'pending' },
        { id: 2, item_name: 'Mouse', status: 'approved' },
      ];

      mockDatabase.query
        .mockResolvedValueOnce({
          rows: solicitacoes,
        })
        .mockResolvedValueOnce({
          rows: [{ total: '2', pending_total: '1' }],
        });

      const resultado = await service.findAll();

      expect(resultado).toEqual({
        data: solicitacoes,
        total: 2,
        pendingTotal: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      expect(mockDatabase.query).toHaveBeenCalledTimes(2);

      expect(mockDatabase.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('FROM purchase_requests pr'),
        [null, 10, 0],
      );

      expect(mockDatabase.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('pending_total'),
        [null],
      );
    });

    it('deve filtrar solicitações pelo status informado', async () => {
      const solicitacoes = [
        { id: 1, item_name: 'Notebook', status: 'pending' },
      ];

      mockDatabase.query
        .mockResolvedValueOnce({
          rows: solicitacoes,
        })
        .mockResolvedValueOnce({
          rows: [{ total: '1', pending_total: '3' }],
        });

      const resultado = await service.findAll('pending');

      expect(resultado).toEqual({
        data: solicitacoes,
        total: 1,
        pendingTotal: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      expect(mockDatabase.query).toHaveBeenCalledTimes(2);

      expect(mockDatabase.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('pr.status = $1'),
        ['pending', 10, 0],
      );

      expect(mockDatabase.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('pending_total'),
        ['pending'],
      );
    });

    it('deve calcular corretamente a quantidade de páginas', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({
          rows: [{ total: '25', pending_total: '8' }],
        });

      const resultado = await service.findAll(undefined, 2, 10);

      expect(resultado.totalPages).toBe(3);
      expect(resultado.page).toBe(2);
      expect(resultado.limit).toBe(10);
      expect(resultado.total).toBe(25);
      expect(resultado.pendingTotal).toBe(8);

      expect(mockDatabase.query).toHaveBeenNthCalledWith(
        1,
        expect.any(String),
        [null, 10, 10],
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar uma solicitação com seu parecer de IA', async () => {
      const solicitacao = {
        id: 1,
        item_name: 'Notebook',
        quantity: 2,
        supplier: {
          id: 1,
          name: 'Fornecedor A',
        },
      };

      const parecer = {
        id: 1,
        purchase_request_id: 1,
        priority: 'high',
        summary_text: 'Solicitação prioritária.',
      };

      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [solicitacao],
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          rows: [parecer],
        });

      const resultado = await service.findOne(1);

      expect(resultado).toEqual({
        ...solicitacao,
        ai_review: parecer,
      });

      expect(mockDatabase.query).toHaveBeenCalledTimes(2);
    });

    it('deve retornar null quando não existir parecer de IA', async () => {
      const solicitacao = {
        id: 1,
        item_name: 'Notebook',
        quantity: 2,
        supplier: null,
      };

      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [solicitacao],
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          rows: [],
        });

      const resultado = await service.findOne(1);

      expect(resultado.ai_review).toBeNull();
    });

    it('deve lançar NotFoundException quando a solicitação não existir', async () => {
      mockDatabase.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      await expect(service.findOne(999)).rejects.toThrow(
        'Solicitação não encontrada',
      );

      expect(mockDatabase.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateStatus', () => {
    it('deve atualizar o status da solicitação', async () => {
      const solicitacaoAtualizada = {
        id: 1,
        item_name: 'Notebook',
        status: 'approved',
      };

      mockDatabase.query.mockResolvedValue({
        rows: [solicitacaoAtualizada],
        rowCount: 1,
      });

      const resultado = await service.updateStatus(1, 'approved');

      expect(resultado).toEqual(solicitacaoAtualizada);

      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE purchase_requests'),
        ['approved', 1],
      );
    });

    it('deve lançar NotFoundException quando a solicitação não existir', async () => {
      mockDatabase.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
      });

      await expect(
        service.updateStatus(999, 'approved'),
      ).rejects.toThrow('Solicitação não encontrada');
    });
  });

  describe('generateReview', () => {
    it('deve lançar NotFoundException quando a solicitação não existir', async () => {
      mockDatabase.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      await expect(service.generateReview(999)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockDatabase.query).toHaveBeenCalledTimes(1);
    });

    it('deve lançar InternalServerErrorException quando a chave da OpenAI não estiver configurada', async () => {
      const apiKeyOriginal = process.env.OPENAI_API_KEY;

      delete process.env.OPENAI_API_KEY;

      mockDatabase.query.mockResolvedValueOnce({
        rows: [mockPurchaseRequest],
        rowCount: 1,
      });

      try {
        await expect(service.generateReview(1)).rejects.toThrow(
          InternalServerErrorException,
        );

        expect(mockDatabase.query).toHaveBeenCalledTimes(1);
      } finally {
        if (apiKeyOriginal !== undefined) {
          process.env.OPENAI_API_KEY = apiKeyOriginal;
        } else {
          delete process.env.OPENAI_API_KEY;
        }
      }
    });

    it('deve gerar um parecer com a OpenAI e salvá-lo no banco', async () => {
      const apiKeyOriginal = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'test-api-key';

      const parecer = {
        id: 1,
        purchase_request_id: 1,
        priority: 'high',
        summary_text: 'Equipamentos antigos precisam ser substituídos.',
      };

      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [mockPurchaseRequest],
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          rows: [parecer],
        });

      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                priority: 'high',
                summary_text: parecer.summary_text,
              }),
            },
          },
        ],
      });

      try {
        const resultado = await service.generateReview(1);

        expect(resultado).toEqual(parecer);

        expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);

        expect(mockDatabase.query).toHaveBeenCalledTimes(2);

        expect(mockDatabase.query).toHaveBeenLastCalledWith(
          expect.stringContaining('INSERT INTO ai_reviews'),
          [1, 'high', parecer.summary_text],
        );
      } finally {
        if (apiKeyOriginal !== undefined) {
          process.env.OPENAI_API_KEY = apiKeyOriginal;
        } else {
          delete process.env.OPENAI_API_KEY;
        }
      }
    });

    it('deve lançar HttpException com status 429 quando atingir o rate limit da OpenAI', async () => {
      const apiKeyOriginal = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'test-api-key';

      mockDatabase.query.mockResolvedValueOnce({
        rows: [mockPurchaseRequest],
        rowCount: 1,
      });

      const rateLimitError = Object.create(RateLimitError.prototype);

      mockOpenAI.chat.completions.create.mockRejectedValueOnce(
        rateLimitError,
      );

      try {
        await expect(service.generateReview(1)).rejects.toMatchObject({
          status: 429,
          response:
            'Limite de requisições à API da OpenAI atingido. Tente novamente mais tarde.',
        });

        expect(mockDatabase.query).toHaveBeenCalledTimes(1);
        expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
      } finally {
        if (apiKeyOriginal !== undefined) {
          process.env.OPENAI_API_KEY = apiKeyOriginal;
        } else {
          delete process.env.OPENAI_API_KEY;
        }
      }
    });

    it('deve lançar GatewayTimeoutException quando a OpenAI demorar para responder', async () => {
      const apiKeyOriginal = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'test-api-key';

      mockDatabase.query.mockResolvedValueOnce({
        rows: [mockPurchaseRequest],
        rowCount: 1,
      });

      const timeoutError = Object.create(
        APIConnectionTimeoutError.prototype,
      );

      mockOpenAI.chat.completions.create.mockRejectedValueOnce(
        timeoutError,
      );

      try {
        await expect(service.generateReview(1)).rejects.toMatchObject({
          status: 504,
          response: {
            statusCode: 504,
            message: 'A OpenAI demorou muito para responder. Tente novamente.',
          },
        });

        expect(mockDatabase.query).toHaveBeenCalledTimes(1);
        expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
      } finally {
        if (apiKeyOriginal !== undefined) {
          process.env.OPENAI_API_KEY = apiKeyOriginal;
        } else {
          delete process.env.OPENAI_API_KEY;
        }
      }
    });
  });
});