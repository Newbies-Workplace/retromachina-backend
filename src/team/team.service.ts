import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MethodNotAllowedException } from '@nestjs/common/exceptions';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenUser } from 'src/types';
import { CreateTeamDto } from './dto/createTeam.dto';
import { EditTeamDto } from './dto/editTeam.dto';
import { BoardColumnDto, EditBoardDto } from './dto/editBoard.dto';
import { BoardColumn } from '@prisma/client';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TeamService {
  constructor(private prismaService: PrismaService) {}

  async getTeam(teamID: string) {
    const teamInfo = await this.prismaService.team.findFirst({
      where: {
        id: teamID,
      },
    });

    if (!teamInfo) throw new NotFoundException();

    return {
      id: teamInfo.id,
      name: teamInfo.name,
    };
  }

  async createTeam(user: TokenUser, createTeamDto: CreateTeamDto) {
    const team = await this.prismaService.team.create({
      data: {
        name: createTeamDto.name,
        scrum_master_id: user.id,
      },
    });

    await this.prismaService.teamUsers.create({
      data: {
        team_id: team.id,
        user_id: user.id,
      },
    });

    const backlogId = uuid()

    await this.prismaService.board.create({
      data: {
        team_id: team.id,
        default_column_id: backlogId,
        BoardColumns: {
          create: {
            id: backlogId,
            name: 'Backlog',
            color: '#1dd7b2',
            order: 0,
          }
        }
      }
    })

    await this.addUsersToTeamUsers(createTeamDto.emails, team.id, user.id);
  }

  async editTeam(user: TokenUser, teamId: string, editTeamDto: EditTeamDto) {
    const checkTeam = await this.prismaService.team.findFirst({
      where: {
        id: teamId,
      },
    });

    if (!checkTeam) throw new NotFoundException();

    if (checkTeam.scrum_master_id !== user.id)
      throw new MethodNotAllowedException();

    await this.prismaService.team.update({
      where: {
        id: teamId,
      },
      data: {
        name: editTeamDto.name,
      },
    });

    // Reset users && leave scrum untouched
    await this.prismaService.teamUsers.deleteMany({
      where: {
        team_id: checkTeam.id,
        NOT: {
          user_id: user.id,
        },
      },
    });

    await this.prismaService.invite.deleteMany({
      where: {
        team_id: checkTeam.id,
      },
    });

    // Add users to teamUsers
    await this.addUsersToTeamUsers(editTeamDto.emails, checkTeam.id, user.id);
  }

  async addUsersToTeamUsers(emails: string[], teamId: string, scrumId: string) {
    for (const email of emails) {
      const user = await this.prismaService.user.findFirst({
        where: {
          email: email,
        },
      });

      if (!user) {
        await this.prismaService.invite.create({
          data: {
            email: email,
            team_id: teamId,
            from_scrum_id: scrumId,
          },
        });

        continue;
      }

      await this.prismaService.teamUsers.create({
        data: {
          team_id: teamId,
          user_id: user.id,
        },
      });
    }
  }

  async deleteTeam(teamId: string) {
    await this.prismaService.team.delete({
      where: {
        id: teamId,
      },
    });
  }

  async editBoard(teamId: string, boardDto: EditBoardDto) {
    const board = await this.prismaService.board.findUnique({
      where: {
        team_id: teamId,
      },
      include: {
        BoardColumns: true
      }
    })

    const deletedColumns: BoardColumn[] = []
    const existingColumns: BoardColumnDto[] = []
    const createdColumns: BoardColumnDto[] = []

    boardDto.columns.forEach((column) => {
      if (board.BoardColumns.map(savedCol => savedCol.id).includes(column.id)) {
        existingColumns.push(column)
      } else {
        createdColumns.push(column)
      }
    })
    board.BoardColumns.forEach((column) => {
      if (!boardDto.columns.map(boardCol => boardCol.id).includes(column.id)) {
        deletedColumns.push(column)
      }
    })

    // throw if trying to delete default column
    if (![...createdColumns, ...existingColumns].map(column => column.id).includes(boardDto.defaultColumnId)) {
      throw new BadRequestException("Cannot delete column that contains defaultColumnId")
    }

    await this.prismaService.boardColumn.createMany({
      data: createdColumns.map(column => {
        return {
          id: column.id,
          name: column.name,
          color: column.color,
          team_id: teamId,
          order: column.order,
        }
      })
    })
    for (const column of existingColumns) {
      await this.prismaService.boardColumn.update({
        where: {
          id: column.id,
        },
        data: {
          name: column.name,
          color: column.color,
          team_id: teamId,
          order: column.order,
        }
      })
    }

    // move cards in deleted columns to default column
    await this.prismaService.task.updateMany({
      where: {
        column_id: {
          in: deletedColumns.map(column => column.id),
        }
      },
      data: {
        column_id: boardDto.defaultColumnId,
      }
    })

    // delete columns
    await this.prismaService.boardColumn.deleteMany({
      where: {
        id: {
          in: deletedColumns.map(column => column.id)
        }
      }
    })
  }

  async getBoard(user: TokenUser, teamId: string): Promise<EditBoardDto> {
    const board = await this.prismaService.board.findUnique({
      where: {
        team_id: teamId,
      },
      include: {
        Team: {
          include: {
            TeamUser: true
          }
        },
        BoardColumns: true
      }
    })

    if (!board.Team.TeamUser.map(teamUser => teamUser.user_id).includes(user.id)) {
      throw new ForbiddenException(`User ${user.id} not in team ${teamId}`)
    }

    return {
      defaultColumnId: board.default_column_id,
      columns: board.BoardColumns.map((column) => {
        return {
          id: column.id,
          name: column.name,
          color: column.color,
          order: column.order,
        }
      })
    }
  }
}
