import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Controller()
export class AppController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('db-test')
  async testDatabase() {
    const result = await this.databaseService.query(
      'SELECT NOW() AS current_time',
    );

    return {
      connected: true,
      time: result.rows[0].current_time,
    };
  }
}