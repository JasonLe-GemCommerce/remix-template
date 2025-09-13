import type { shopifyApp } from '@shopify/shopify-app-remix/server';
import type { shopifyApi } from '@shopify/shopify-api';

export type TShopifyAppConfig = Parameters<typeof shopifyApp>[0];
export type TShopifyApi = Parameters<typeof shopifyApi>[0];
export type TParams = { api: any; config: TShopifyAppConfig; logger: any };
