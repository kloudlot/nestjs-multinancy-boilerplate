import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginDto {
 
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  password: string;
}
