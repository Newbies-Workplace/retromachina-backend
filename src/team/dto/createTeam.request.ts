import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateTeamRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  emails?: string[];
}
