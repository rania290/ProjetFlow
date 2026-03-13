import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class CustomLogger implements LoggerService {
  log(message: string, context?: string) {
    if (
      message.includes('Starting') ||
      message.includes('dependencies') ||
      message.includes('Mapped') ||
      message.includes('successfully started') ||
      message.includes('RoutesResolver') ||
      message.includes('InstanceLoader')
    ) {
      console.log(
        `[Nest] ${new Date().toISOString().slice(11, 19)} LOG ${message}`,
      );
    }
  }

  error(message: string, trace?: string, context?: string) {
    console.error(
      `[Nest] ${new Date().toISOString().slice(11, 19)} ERROR ${message}`,
    );
    if (trace) {
      console.error(`[Nest] TRACE: ${trace}`);
    }
  }

  warn(message: string, context?: string) {
    console.warn(
      `[Nest] ${new Date().toISOString().slice(11, 19)} WARN ${message}`,
    );
  }

  debug(message: string, context?: string) {
    console.log(
      `[Nest] ${new Date().toISOString().slice(11, 19)} DEBUG ${message}`,
    );
  }

  verbose(message: string, context?: string) {
    console.log(
      `[Nest] ${new Date().toISOString().slice(11, 19)} VERBOSE ${message}`,
    );
  }
}

