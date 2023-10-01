import { ApiProperty } from "@nestjs/swagger";
import { TenancyUserType } from "../entities/tenant-user.entity";

export class CreateTenantUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  password: string;

  @ApiProperty({
    enum: TenancyUserType
  })
  type: TenancyUserType;
}
