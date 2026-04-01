import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : { message: 'Erreur interne du serveur' };

    const timestamp = new Date().toISOString();

    // Logger l'erreur
    this.logger.error(
      `${timestamp} ${request.method} ${request.url} ${status}`,
      exception.stack,
    );

    // Envoyer la réponse d'erreur
    response.status(status).json({
      statusCode: status,
      timestamp,
      path: request.url,
      method: request.method,
      message: typeof message === 'string' ? message : (message as any).message,
      error: exception instanceof HttpException ? exception.message : 'Internal server error',
    });
  }
}
