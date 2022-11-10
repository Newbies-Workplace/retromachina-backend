import { Controller, Get, Query } from '@nestjs/common';

@Controller('tasks')
export class TaskController {
  @Get()
  getTasks(@Query('retro_id') retroID: string) {}
}
