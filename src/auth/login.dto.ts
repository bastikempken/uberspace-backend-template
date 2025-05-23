import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  readonly token: string;
}
