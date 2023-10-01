import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TenantUsersService } from './tenant-users.service';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import { UpdateTenantUserDto } from './dto/update-tenant-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('tenant-users')
export class TenantUsersController {
  constructor(private readonly tenantUsersService: TenantUsersService) {}

  @Post()
  create(@Body() createTenantUserDto: CreateTenantUserDto) {
    return this.tenantUsersService.create(createTenantUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Get()
  findAll(@Req() req: any) {
    console.log(req.user)
    return this.tenantUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantUsersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTenantUserDto: UpdateTenantUserDto) {
    return this.tenantUsersService.update(+id, updateTenantUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantUsersService.remove(+id);
  }
}
