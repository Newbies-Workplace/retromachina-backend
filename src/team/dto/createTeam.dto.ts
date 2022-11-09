import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CreateTeamDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  emails?: string[];
}
