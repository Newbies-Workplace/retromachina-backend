import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  getTasks(@Query('retro_id') retroID: string) {
    if (retroID.trim().length === 0)
      throw new BadRequestException('No query param');
  }
}
