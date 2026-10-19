import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly database: DatabaseService) {}

  async create(dto: CreateSupplierDto) {
    const result = await this.database.query(
      `INSERT INTO suppliers (name, email, phone, category)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, category, created_at`,
      [
        dto.name,
        dto.email,
        dto.phone ?? null,
        dto.category ?? null,
      ],
    );

    return result.rows[0];
  }

  async findAll() {
    const result = await this.database.query(
      `SELECT id, name, email, phone, category, created_at
       FROM suppliers
       ORDER BY id`,
    );

    return result.rows;
  }
}