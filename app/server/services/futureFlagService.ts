import type { Session } from "@shopify/shopify-app-remix/server";
import type { IFutureFlag } from "~/modules/apps/types";
import type { ShopMeta } from "@prisma/client";

import { DEFAULT_FUTURE_FLAG } from "~/modules/apps/constants";
import { ShopMetaRepository } from "../repositories/shopMetaRepository";
import { sentryCaptureException } from "~/exceptions/sentry";
import { FUTURE_FLAG_KEY } from "../constants";

export interface IFutureFlagService {
  getFutureFlags({ session }: { session: Session }): Promise<IFutureFlag>;
  handleSyncFutureFlags({ session }: { session: Session }): Promise<ShopMeta>;
}

export class FutureFlagService implements IFutureFlagService {
  private readonly shopMetaRepository: ShopMetaRepository;

  constructor() {
    this.shopMetaRepository = new ShopMetaRepository();
  }

  /**
   * Retrieves the future flags for the given shop session.
   */
  async getFutureFlags({
    session,
  }: {
    session: Session;
  }): Promise<IFutureFlag> {
    try {
      const shop = session.shop;
      const shopMeta = await this.shopMetaRepository.findShopMetaByKey(
        shop,
        FUTURE_FLAG_KEY,
      );

      let futureFlags: Partial<IFutureFlag> = {};
      if (shopMeta?.value && typeof shopMeta.value === "string") {
        try {
          futureFlags = JSON.parse(shopMeta.value || "{}");
        } catch (error) {
          sentryCaptureException(
            "FutureFlagService - getFutureFlags",
            "Error",
            error as Error,
            {
              level: "error",
            },
          );
        }
      }

      return { ...DEFAULT_FUTURE_FLAG, ...futureFlags };
    } catch (error) {
      sentryCaptureException(
        "FutureFlagService - getFutureFlags",
        "Error",
        error as Error,
        {
          level: "error",
        },
      );
      throw new Error(
        `Failed to fetch future flags: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Synchronizes the future flags for the given shop session.
   */
  async handleSyncFutureFlags({
    session,
  }: {
    session: Session;
  }): Promise<ShopMeta> {
    try {
      const shop = session.shop;

      // Get current future flags or initialize defaults
      const currentFlags = await this.getFutureFlags({ session });

      // Merge with default flags
      const newFutureFlags: IFutureFlag = {
        ...DEFAULT_FUTURE_FLAG,
        ...currentFlags,
      };

      // Update the shop meta with the new flags
      const updatedValue = JSON.stringify(newFutureFlags);
      const response = await this.shopMetaRepository.upsertShopMetaByKey(
        shop,
        FUTURE_FLAG_KEY,
        updatedValue,
      );

      return response;
    } catch (error) {
      sentryCaptureException(
        "FutureFlagService - handleSyncFutureFlags",
        "Error",
        error as Error,
        {
          level: "error",
        },
      );
      throw new Error(
        `Failed to sync future flags: ${(error as Error).message}`,
      );
    }
  }
}
