import { IsArray, IsString } from 'class-validator';

export class EditTeamDto {
  @IsString()
  name: string;

  @IsArray()
  emails: string[];
}
