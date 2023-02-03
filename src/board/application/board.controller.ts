import { Body, Controller, ForbiddenException, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../auth/jwt/jwt.guard';
import { User } from '../../auth/jwt/jwtuser.decorator';
import { JWTUser } from '../../auth/jwt/JWTUser';
import { EditBoardDto } from './board/editBoard.dto';
import { BoardService } from '../board.service';
import { BoardResponse } from './board/board.response';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('teams')
export class BoardController {

  constructor(
    private boardService: BoardService,
    private prismaService: PrismaService,
  ) {}

  @UseGuards(JwtGuard)
  @Put(':id/board')
  async editBoard(
    @User() user: JWTUser,
    @Body() boardDto: EditBoardDto,
    @Param('id') teamId: string,
  ) {
    if (!user.isScrum) {
      throw new ForbiddenException()
    }

    await this.boardService.editBoard(teamId, boardDto)
  }

  @UseGuards(JwtGuard)
  @Get(':id/board')
  async getBoard(
    @User() user: JWTUser,
    @Param('id') teamId: string,
  ): Promise<BoardResponse> {
    const board = await this.prismaService.board.findUnique({
      where: {
        team_id: teamId,
      },
      include: {
        Team: {
          include: {
            TeamUser: true,
          },
        },
        BoardColumns: true,
        Tasks: true,
      }
    })

    if (!board.Team.TeamUser.map(teamUser => teamUser.user_id).includes(user.id)) {
      throw new ForbiddenException(`User ${user.id} not in team ${teamId}`)
    }

    return {
      defaultColumnId: board.default_column_id,
      columns: board.BoardColumns.map((col) => ({
        id: col.id,
        order: col.order,
        color: col.color,
        name: col.name,
      })),
      tasks: board.Tasks.map((task) => ({
        id: task.id,
        ownerId: task.owner_id,
        text: task.description,
        columnId: task.column_id,
      }))
    }
  }
}