import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { LoggingService } from "./logging.service";
import { LoggingInterceptor } from "./logging.interceptor";

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [LoggingService, {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor
  }],
  exports: [LoggingService]
})
export class LoggingModule {
}
