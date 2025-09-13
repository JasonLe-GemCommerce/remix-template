import type { Session } from '@prisma/client';

export interface ISession {
  findOfflineSession(shop: string): Promise<Session>;
  findOnlineSession(shop: string): Promise<Session>;
}
