import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import type { Session } from "@shopify/shopify-api";

import { sentryCaptureException } from "~/exceptions/sentry";
import { GemSessionService } from "./gemSessionService";
import { FutureFlagService } from "./futureFlagService";

export class AfterAuthService {
  static readonly handleInitApp = async ({ session }: { session: Session }) => {
    try {
      const gemSessionService = new GemSessionService();

      const associatedUser = session.onlineAccessInfo?.associated_user;
      if (!associatedUser || !session?.accessToken) return;

      await gemSessionService.fetchGemSession({ session });
    } catch (error) {
      sentryCaptureException(
        "AfterAuth - handleInitApp",
        "Error",
        error as Error,
        {
          level: "error",
        },
      );
      throw new Error((error as Error).message);
    }
  };

  static readonly handleSyncFutureFlags = async ({
    session,
  }: {
    session: Session;
  }) => {
    try {
      const futureFlagService = new FutureFlagService();
      await futureFlagService.handleSyncFutureFlags({ session });
    } catch (error) {
      sentryCaptureException(
        "AfterAuth - handleInitApp",
        "Error",
        error as Error,
        {
          level: "error",
        },
      );
      throw new Error((error as Error).message);
    }
  };

  static readonly handleRegisterWebhook = async ({
    admin,
  }: {
    admin: AdminApiContext;
  }) => {
    // const webhookRepo = new WebhookRepository(admin, SHOPIFY_APP_URL || "");
    // try {
    //   const existingWebhooks = await webhookRepo.getExistingWebhooks();
    //   for (const webhook of WEBHOOK_TOPICS) {
    //     try {
    //       const exists = await webhookRepo.webhookExists(
    //         webhook,
    //         existingWebhooks,
    //       );
    //       if (exists) continue;
    //       await webhookRepo.createWebhook(webhook);
    //       console.log(
    //         `Successfully created/verified webhook for ${webhook.topic}`,
    //       );
    //     } catch (error) {
    //       console.error(`Error processing webhook ${webhook.topic}:`, error);
    //     }
    //   }
    // } catch (error) {
    //   console.error("General error in handleRegisterWebhook:", error);
    // }
  };
}
