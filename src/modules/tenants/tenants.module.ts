import { Module } from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { TenantsController } from "./tenants.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Tenants, TenantSchema } from "./entities/tenant.entity";
import { CustomTenantValidator } from "./custom-tenant.validator";





@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenants.name, schema: TenantSchema },
    ]),
  ],
  controllers: [TenantsController],
  providers: [TenantsService, CustomTenantValidator],
  exports: [TenantsService, CustomTenantValidator], // export this service to other modules
})
export class TenantsModule {}
