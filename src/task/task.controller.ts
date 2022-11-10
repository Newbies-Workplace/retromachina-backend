import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @UseGuards(JwtGuard)
  @Get()
  async getTasks(@Query() query: { team_id?: string; retro_id?: string }) {
    if (query.retro_id) {
      if (query.retro_id.length === 0) {
        throw new BadRequestException('Bad query param');
      }
      return await this.taskService.getRetroTasks(query.retro_id);
    } else if (query.team_id) {
      if (query.team_id.length === 0) {
        throw new BadRequestException('Bad query param');
      }
      return await this.taskService.getTeamTasks(query.team_id);
    }
  }
}
