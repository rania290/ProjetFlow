import { Injectable, NestMiddleware } from "@nestjs/common";

@Injectable()
export class LeaveLoggerMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: () => void) {
    const method = req.method;
    const url = req.originalUrl || req.url;
    const timestamp = new Date().toISOString();

    const authHeader: string | undefined = req.headers["authorization"];
    const bearerUserId =
      authHeader?.startsWith("Bearer ") ? authHeader.substring("Bearer ".length).trim() : undefined;
    const userId = req.headers["x-user-id"] || bearerUserId || "anonymous";

    // eslint-disable-next-line no-console
    console.log(`[HR-SERVICE] ${method} ${url} — user:${userId} — ${timestamp}`);
    next();
  }
}

