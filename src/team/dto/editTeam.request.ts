import { IsArray, IsString } from 'class-validator';

export class EditTeamRequest {
  @IsString()
  name: string;

  @IsArray()
  emails: string[];
}
