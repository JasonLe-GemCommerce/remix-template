import type { ShopMeta } from '@prisma/client';

export interface IShopMeta {
  findShopMetaByKey(shop: string, key: string): Promise<ShopMeta | null>;
  upsertShopMetaByKey(shop: string, key: string, value: string): Promise<ShopMeta>;
}
