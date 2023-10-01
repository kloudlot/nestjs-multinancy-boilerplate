import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsAlphanumeric,
  Matches,
  IsNumberString,
  IsAlpha,
  MaxLength,
  Length,
} from "class-validator";

export class CreateTenantDto {
  @ApiProperty({
    required: true,
  })
  @IsEmail()
  email: string;

  // @ApiProperty({
  //   required: true,
  // })
  // @Matches(/^[a-zA-Z ]+$/)
  // @IsNotEmpty()
  // schoolName: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    required: true,
  })
  @Length(5,15)
  @IsAlpha(undefined, {
    message: "Portal name should alphabets only.",
  })
  portal: string;

  @ApiProperty({
    required: true,
  })
  @IsNumberString()
  phoneNumber: string;
}
