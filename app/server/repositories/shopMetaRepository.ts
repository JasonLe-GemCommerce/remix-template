import type { ShopMeta } from "@prisma/client";
import prisma from "~/db.server";

export class ShopMetaRepository {
  /**
   * Find shop metadata by shop and key
   */
  async findShopMetaByKey(shop: string, key: string): Promise<ShopMeta | null> {
    try {
      return await prisma.shopMeta.findFirst({
        where: {
          shop,
          key,
        },
      });
    } catch (error) {
      console.error("Error finding shop meta by key:", error);
      return null;
    }
  }

  /**
   * Upsert shop metadata by key
   */
  async upsertShopMetaByKey(
    shop: string,
    key: string,
    value: string,
  ): Promise<ShopMeta> {
    return await prisma.shopMeta.upsert({
      where: {
        shop_key: {
          shop,
          key,
        },
      },
      update: {
        value,
        updatedAt: new Date(),
      },
      create: {
        shop,
        key,
        value,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete shop metadata by key
   */
  async deleteShopMetaByKey(shop: string, key: string): Promise<boolean> {
    try {
      await prisma.shopMeta.delete({
        where: {
          shop_key: {
            shop,
            key,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting shop meta by key:", error);
      return false;
    }
  }

  /**
   * Get all shop metadata for a shop
   */
  async findAllShopMeta(shop: string): Promise<ShopMeta[]> {
    try {
      return await prisma.shopMeta.findMany({
        where: {
          shop,
        },
      });
    } catch (error) {
      console.error("Error finding all shop meta:", error);
      return [];
    }
  }
}
