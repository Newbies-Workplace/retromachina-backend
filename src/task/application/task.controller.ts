import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { TaskService } from '../task.service';
import { TaskResponse } from './dto/task.response';

@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @UseGuards(JwtGuard)
  @Get()
  async getTasks(@Query() query: { team_id?: string; retro_id?: string }): Promise<TaskResponse[]> {
    if (query.retro_id && query.retro_id.length !== 0) {
      const tasks = await this.taskService.getRetroTasks(query.retro_id)

      return tasks.map(task => ({
        id: task.id,
        ownerId: task.owner_id,
        columnId: task.column_id,
        text: task.description,
      }))
    } else if (query.team_id && query.team_id.length !== 0) {
      const tasks = await this.taskService.getTeamTasks(query.team_id);

      return tasks.map(task => ({
        id: task.id,
        ownerId: task.owner_id,
        columnId: task.column_id,
        text: task.description,
      }))
    }

    throw new BadRequestException('Bad query param');
  }
}
