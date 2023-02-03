import { Module } from '@nestjs/common';
import { BoardController } from './application/board.controller';
import { BoardService } from './board.service';
import { BoardGateway } from './application/board.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [BoardService, BoardGateway],
  controllers: [BoardController],
})
export class BoardModule {}
