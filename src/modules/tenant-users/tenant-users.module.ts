import { Module } from '@nestjs/common';
import { TenantUsersService } from './tenant-users.service';
import { TenantUsersController } from './tenant-users.controller';
import { TenancyModule } from '@needle-innovision/nestjs-tenancy';
import { TenantUser, TenantUserSchema } from './entities/tenant-user.entity';

@Module({
  imports: [TenancyModule.forFeature([{name: TenantUser.name, schema: TenantUserSchema}])],
  controllers: [TenantUsersController],
  providers: [TenantUsersService],
  exports: [TenantUsersService]
})
export class TenantUsersModule {}
