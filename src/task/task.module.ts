import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './application/task.controller';
import { JwtStrategy } from 'src/auth/jwt/jwt.strategy';

@Module({
  providers: [TaskService, JwtStrategy],
  controllers: [TaskController],
})
export class TaskModule {}
