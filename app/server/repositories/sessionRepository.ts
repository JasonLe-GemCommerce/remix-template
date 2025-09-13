import type { ISession } from "./interface/session";
import type { Session } from "@prisma/client";

import prisma from "~/db.server";

export class SessionRepository implements ISession {
  async findOfflineSession(shop: string): Promise<Session> {
    try {
      const result = await prisma.session.findFirstOrThrow({
        where: { shop, isOnline: false, expires: null, userId: null },
      });
      return result;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async findOnlineSession(shop: string): Promise<Session> {
    try {
      const result = await prisma.session.findFirstOrThrow({
        where: { shop, isOnline: true },
      });
      return result;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
}
