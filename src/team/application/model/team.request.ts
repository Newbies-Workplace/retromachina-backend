import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class TeamRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  emails?: string[]; //todo add roles
}

export class EditTeamRequest {
  @IsString()
  name: string;

  @IsArray()
  emails: string[]; //todo add roles
}
