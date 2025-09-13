import type { TShopifyAppConfig } from '../types';
import type { Session } from '@prisma/client';

import { LATEST_API_VERSION, shopifyApi } from '@shopify/shopify-api';
import { AppDistribution } from '@shopify/shopify-app-remix/server';
import { SHOPIFY_APP_LOCAL } from '../config';

import prisma from '~/db.server';

export async function getSessionTokenContextForLocal() {
  try {
    const shop = SHOPIFY_APP_LOCAL.SHOP;
    const onlineSession = await getSessionByShopForLocal(shop, true);
    const offlineSession = await getSessionByShopForLocal(onlineSession?.shop, false);
    const sessionId = onlineSession?.id;
    const sessionToken = onlineSession?.accessToken;
    return { shop, sessionToken, sessionId, onlineSession, offlineSession };
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export async function getSessionByShopForLocal(
  shop: string | undefined,
  isOnline: boolean,
): Promise<Session | null> {
  const session = await prisma.session.findFirst({
    where: {
      ...(shop && { shop }),
      isOnline,
    },
  });
  return session;
}

export function deriveApi(
  appConfig: TShopifyAppConfig & { appUrl?: string; hostScheme?: 'http' | 'https' },
) {
  try {
    const appUrl: URL = new URL(appConfig.appUrl);
    if (appUrl.hostname === 'localhost' && !appUrl.port && process.env.PORT) {
      appUrl.port = process.env.PORT;
    }
    appConfig.appUrl = appUrl.origin;
    const userAgentPrefix = `Shopify Remix Library`;
    return shopifyApi({
      ...appConfig,
      hostName: appUrl.host,
      hostScheme: appUrl.protocol.replace(':', '') as 'http' | 'https' | undefined,
      userAgentPrefix,
      isEmbeddedApp: appConfig.isEmbeddedApp ?? true,
      apiVersion: appConfig.apiVersion ?? LATEST_API_VERSION,
      isCustomStoreApp: appConfig.distribution === AppDistribution.ShopifyAdmin,
      billing: appConfig.billing,
      future: {
        lineItemBilling: true,
        unstable_managedPricingSupport: true,
      },
      _logDisabledFutureFlags: false,
    });
  } catch (error) {
    console.log(`🚀 ~ deriveApi ~ error:`, (error as Error).message);
    throw new Error((error as Error).message);
  }
}
