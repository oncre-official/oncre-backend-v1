import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as winston from 'winston';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const SlackHook = require('winston-slack-webhook-transport');

@Injectable()
export class SlackLoggerService extends Logger implements OnModuleDestroy {
  private logger: winston.Logger;

  constructor(webhookUrl: string | undefined) {
    super();

    this.logger = winston.createLogger({
      level: 'info',
      transports: [
        new winston.transports.Console(),
        new SlackHook({
          webhookUrl,
          level: 'info',
          formatter: (info) => ({
            text:
              `📢 *Notification* 📢\n\n` +
              `*Level:* ${info.level.toUpperCase()}\n` +
              `*Message:* ${info.message}\n` +
              `*Timestamp:* ${new Date().toISOString()}`,
          }),
        }),
      ],
    });
  }

  logError(message: string, url?: string, trace?: string, email?: string) {
    this.logger.error({
      message:
        `🚨 *Error Logged in API* 🚨\n\n` +
        `*URL:* ${url || 'Unknown URL'}\n` +
        `*User email:* ${email || 'Unknown User email'}\n` +
        `*Message:* ${message}\n` +
        `*Trace:* ${trace || 'N/A'}`,
    });
  }

  logApiError(url: string, method: string, error: any, payload?: Record<any, any>) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    const errorDetails = error.response?.data ? JSON.stringify(error.response?.data, null, 2) : 'No response data';

    const status = error.response?.status || 'Unknown';
    const payloadString = payload ? JSON.stringify(payload, null, 2) : 'No payload provided';

    this.logger.error({
      message:
        `❌ *API Request Failed* ❌\n\n` +
        `*URL:* ${url}\n` +
        `*Method:* ${method}\n` +
        `*Payload:* \`\`\`${payloadString}\`\`\`\n` +
        `*Error Message:* ${errorMessage}\n` +
        `*Status Code:* ${status}\n` +
        `*Response Details:* \`\`\`${errorDetails}\`\`\``,
    });
  }

  logMessage(message: string) {
    this.logger.info(`${message}`);
  }

  onModuleDestroy() {
    this.logger.close();
  }
}
