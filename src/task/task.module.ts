import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';

@Module({
  providers: [TaskService, JwtStrategy],
  controllers: [TaskController],
})
export class TaskModule {}
