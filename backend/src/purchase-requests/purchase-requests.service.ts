import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import OpenAI from 'openai';

import { DatabaseService } from '../database/database.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';

@Injectable()
export class PurchaseRequestsService {
  constructor(private readonly database: DatabaseService) {}

  async create(dto: CreatePurchaseRequestDto) {
    const result = await this.database.query(
      `INSERT INTO purchase_requests
        (item_name, quantity, supplier_id, requester_name, justification)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        dto.item_name,
        dto.quantity,
        dto.supplier_id ?? null,
        dto.requester_name,
        dto.justification ?? null,
      ],
    );

    return result.rows[0];
  }

  async findAll(status?: string) {
    const result = await this.database.query(
      `SELECT
        pr.id,
        pr.item_name,
        pr.quantity,
        pr.supplier_id,
        pr.requester_name,
        pr.justification,
        pr.status,
        pr.created_at,
        ar.priority AS ai_priority,
        ar.summary_text AS ai_summary_text
      FROM purchase_requests pr
      LEFT JOIN LATERAL (
        SELECT priority, summary_text
        FROM ai_reviews
        WHERE purchase_request_id = pr.id
        ORDER BY generated_at DESC
        LIMIT 1
      ) ar ON true
      WHERE $1::VARCHAR IS NULL OR pr.status = $1
      ORDER BY pr.created_at DESC`,
      [status ?? null],
    );

    return result.rows;
  }

  async findOne(id: number) {
    const requestResult = await this.database.query(
      `SELECT *
       FROM purchase_requests
       WHERE id = $1`,
      [id],
    );

    if (requestResult.rowCount === 0) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    const reviewResult = await this.database.query(
      `SELECT id, purchase_request_id, priority, summary_text, generated_at
       FROM ai_reviews
       WHERE purchase_request_id = $1
       ORDER BY generated_at DESC
       LIMIT 1`,
      [id],
    );

    return {
      ...requestResult.rows[0],
      ai_review: reviewResult.rows[0] ?? null,
    };
  }

  async updateStatus(id: number, status: string) {
    const result = await this.database.query(
      `UPDATE purchase_requests
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    return result.rows[0];
  }

  async generateReview(id: number) {
    // Busca os dados da solicitação
    const result = await this.database.query(
      `SELECT id, item_name, quantity, justification
      FROM purchase_requests
      WHERE id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    const request = result.rows[0];

    // Verifica se a chave da OpenAI foi configurada
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new InternalServerErrorException(
        'A chave da API OpenAI não foi configurada',
      );
    }

    const openai = new OpenAI({ apiKey });

    // Pede à IA que classifique a solicitação
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
            Você analisa solicitações de compra de uma organização.
            Classifique a prioridade como high, medium ou low,
            considerando o item solicitado, a quantidade e a justificativa.
            Gere um resumo objetivo, com no máximo duas frases,
            explicando o motivo da classificação.
            Não invente informações que não estejam nos dados.
          `,
        },
        {
          role: 'user',
          content: JSON.stringify({
            item: request.item_name,
            quantidade: request.quantity,
            justificativa: request.justification,
          }),
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'purchase_request_review',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              priority: {
                type: 'string',
                enum: ['high', 'medium', 'low'],
              },
              summary_text: {
                type: 'string',
              },
            },
            required: ['priority', 'summary_text'],
            additionalProperties: false,
          },
        },
      },
    });

    // Interpreta a resposta da IA
    const content = completion.choices[0]?.message.content;

    if (!content) {
      throw new InternalServerErrorException(
        'A IA não retornou um parecer válido',
      );
    }

    const review = JSON.parse(content) as {
      priority: 'high' | 'medium' | 'low';
      summary_text: string;
    };

    // Salva o parecer no PostgreSQL
    const savedReview = await this.database.query(
      `INSERT INTO ai_reviews
        (purchase_request_id, priority, summary_text)
      VALUES ($1, $2, $3)
      RETURNING id, purchase_request_id, priority,
                summary_text, generated_at`,
      [id, review.priority, review.summary_text],
    );

    // Retorna o parecer salvo
    return savedReview.rows[0];
  }
}