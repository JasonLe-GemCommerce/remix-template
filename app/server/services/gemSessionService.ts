import type { Session } from "@shopify/shopify-app-remix/server";
import type { ShopifyData } from "../types/initApp";

import { SessionRepository } from "../repositories/sessionRepository";
import { sentryCaptureException } from "~/exceptions/sentry";
import { EncryptionService } from "./encryptionService";
import { add } from "date-fns";

import jwt from "jsonwebtoken";

interface FetchGemSessionParams {
  session: Session;
}

interface FetchGemSessionResponse {
  shopifyData: ShopifyData;
  gemSession: string;
}

const GEM_SESSION_DURATION_BY_HOUR = process.env.GEM_SESSION_DURATION_BY_HOUR;
const GEM_INTERCOM_SECURE_KEY = process.env.GEM_INTERCOM_SECURE_KEY;

export interface IGemSession {
  fetchGemSession({
    session,
  }: FetchGemSessionParams): Promise<FetchGemSessionResponse>;
  expireGemSession(): number;
}

export class GemSessionService implements IGemSession {
  private readonly sessionRepository: SessionRepository;
  private readonly encryptionService: EncryptionService;

  constructor() {
    this.sessionRepository = new SessionRepository();
    this.encryptionService = new EncryptionService();
  }

  async fetchGemSession({
    session: { onlineAccessInfo, id, shop },
  }: FetchGemSessionParams): Promise<FetchGemSessionResponse> {
    const associatedUser = onlineAccessInfo?.associated_user;
    if (!associatedUser) throw new Error("Associated user not found");

    try {
      const sessionOfflineData =
        await this.sessionRepository.findOfflineSession(shop);

      const accessToken = sessionOfflineData.accessToken;
      const encryptAccessToken = this.encryptionService.encrypt(accessToken);
      const userHash = this.encryptionService.generateHmac(
        shop,
        GEM_INTERCOM_SECURE_KEY,
      );

      const shopifyData: ShopifyData = {
        session: {
          session_id: id,
          shopify_domain: shop,
          shopify_user: {
            id: associatedUser.id,
            email: associatedUser.email,
            first_name: associatedUser.first_name,
            last_name: associatedUser.last_name,
            account_owner: associatedUser.account_owner,
            locale: associatedUser.locale,
            collaborator: associatedUser.collaborator,
            email_verified: associatedUser.email_verified,
          },
        },
        userHash,
        shopify_domain: shop,
        shopify_token: encryptAccessToken,
        expired: this.expireGemSession(),
      };

      const gemSession = jwt.sign(
        shopifyData,
        this.encryptionService.RSA_PRIVATE_KEY,
        { algorithm: "RS256" },
      );

      return {
        gemSession,
        shopifyData,
      };
    } catch (error) {
      sentryCaptureException(
        "GemSession - fetchGemSession",
        "Error",
        error as Error,
        {
          level: "error",
        },
      );
      throw new Error((error as Error).message);
    }
  }

  expireGemSession() {
    return Math.floor(
      add(new Date(), {
        hours: Number(GEM_SESSION_DURATION_BY_HOUR),
      }).getTime() / 1000,
    );
  }
}
