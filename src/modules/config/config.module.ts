import { Module } from "@nestjs/common";
import { ConfigService } from "./config.service";
import { ConfigModule as ConfigENV } from '@nestjs/config';
import configuration from "./config";

@Module({
  imports:[ConfigENV.forRoot(
    {
      isGlobal: true,
      load: [configuration],
    }
  )],
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(".env"),
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
