import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseRequestsModule } from './purchase-requests/purchase-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env'
    }),
    DatabaseModule,
    SuppliersModule,
    PurchaseRequestsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}