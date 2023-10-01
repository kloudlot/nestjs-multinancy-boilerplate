import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule } from "../config/config.module";
import { ConfigService } from "../config/config.service";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { AuthController } from "./auth.controller";
import { TenantsModule } from "../tenants/tenants.module";
import { TenancyModule } from "@needle-innovision/nestjs-tenancy";
import { TenantUsersModule } from "../tenant-users/tenant-users.module";

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get("WEBTOKEN_SECRET_KEY"),
          signOptions: {
            ...(configService.get("WEBTOKEN_EXPIRATION_TIME")
              ? {
                  expiresIn: Number(
                    configService.get("WEBTOKEN_EXPIRATION_TIME"),
                  ),
                }
              : {}),
          },
          
        };
      },
      inject: [ConfigService],
    }),
    TenantsModule,
    TenantUsersModule
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService],
  exports: [PassportModule.register({ defaultStrategy: "jwt" })],
})
export class AuthModule {}
