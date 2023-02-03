import { BoardColumnDto } from './editBoard.dto';
import { TaskResponse } from '../../../task/application/dto/task.response';

export interface BoardResponse {
  columns: BoardColumnDto[]
  defaultColumnId: string
  tasks: TaskResponse[]
}