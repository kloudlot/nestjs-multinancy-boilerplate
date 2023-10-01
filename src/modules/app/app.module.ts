import * as winston from "winston";
import * as rotateFile from "winston-daily-rotate-file";
import { Module } from "@nestjs/common";
import { TenancyModule } from "@needle-innovision/nestjs-tenancy";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongooseModule, MongooseModuleAsyncOptions } from "@nestjs/mongoose";
import { ConfigModule } from "../config/config.module";
import { ConfigService } from "../config/config.service";
import { AuthModule } from "../auth/auth.module";
import { WinstonModule } from "../winston/winston.module";
import { TenantsModule } from "../tenants/tenants.module";
import { CustomTenantValidator } from "../tenants/custom-tenant.validator";
import { TenantUsersModule } from "../tenant-users/tenant-users.module";


@Module({
  imports: [
    // Tenant async configuration
    TenancyModule.forRootAsync({
      imports: [
        ConfigModule,
        TenantsModule,
        TenantUsersModule
      ],
      useFactory: async (cfs: ConfigService, tVal: CustomTenantValidator) => {
        return {
          // Base tenant configurations
          tenantIdentifier: "X-TENANT-ID",
          options: () => {},
          uri: (tenantId: string) => `${cfs.get("DB_URL")}-${tenantId}`,
          validator: (tenantId: string) => tVal.setTenantId(tenantId),
        };
      },
      inject: [ConfigService, CustomTenantValidator],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule, TenantsModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ({
          uri: configService.get("DB_URL"),
          useNewUrlParser: true,
          useUnifiedTopology: true,
        } as MongooseModuleAsyncOptions),
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.isEnv("dev")
          ? {
              level: "info",
              format: winston.format.json(),
              defaultMeta: { service: "user-service" },
              transports: [
                new winston.transports.Console({
                  format: winston.format.simple(),
                }),
              ],
            }
          : {
              level: "info",
              format: winston.format.json(),
              defaultMeta: { service: "user-service" },
              transports: [
                new winston.transports.File({
                  filename: "logs/error.log",
                  level: "error",
                }),
                new winston.transports.Console({
                  format: winston.format.simple(),
                }),
                new rotateFile({
                  filename: "logs/application-%DATE%.log",
                  datePattern: "YYYY-MM-DD",
                  zippedArchive: true,
                  maxSize: "20m",
                  maxFiles: "14d",
                }),
              ],
            };
      },
    }),
    ConfigModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
