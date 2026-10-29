import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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
      `SELECT *
       FROM purchase_requests
       WHERE $1::VARCHAR IS NULL OR status = $1
       ORDER BY created_at DESC`,
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
}