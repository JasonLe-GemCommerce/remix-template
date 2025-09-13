import type * as Types from "../../../schemas/shopify/admin.types";

export type ProductOptionNodeFragment = Pick<
  Types.ProductOption,
  "id" | "name"
>;

export type ProductNodeFragment = Pick<
  Types.Product,
  "id" | "title" | "handle" | "totalInventory" | "status" | "updatedAt"
> & {
  variantsCount?: Types.Maybe<Pick<Types.Count, "count">>;
  priceRangeV2: {
    maxVariantPrice: Pick<Types.MoneyV2, "amount" | "currencyCode">;
    minVariantPrice: Pick<Types.MoneyV2, "amount" | "currencyCode">;
  };
  compareAtPriceRange?: Types.Maybe<{
    maxVariantCompareAtPrice: Pick<Types.MoneyV2, "amount" | "currencyCode">;
    minVariantCompareAtPrice: Pick<Types.MoneyV2, "amount" | "currencyCode">;
  }>;
  options: Array<Pick<Types.ProductOption, "id" | "name">>;
};

export type ProductEdgesFragment = {
  edges: Array<
    Pick<Types.ProductEdge, "cursor"> & {
      node: Pick<
        Types.Product,
        "id" | "title" | "handle" | "totalInventory" | "status" | "updatedAt"
      > & {
        variantsCount?: Types.Maybe<Pick<Types.Count, "count">>;
        priceRangeV2: {
          maxVariantPrice: Pick<Types.MoneyV2, "amount" | "currencyCode">;
          minVariantPrice: Pick<Types.MoneyV2, "amount" | "currencyCode">;
        };
        compareAtPriceRange?: Types.Maybe<{
          maxVariantCompareAtPrice: Pick<
            Types.MoneyV2,
            "amount" | "currencyCode"
          >;
          minVariantCompareAtPrice: Pick<
            Types.MoneyV2,
            "amount" | "currencyCode"
          >;
        }>;
        options: Array<Pick<Types.ProductOption, "id" | "name">>;
      };
    }
  >;
};

export const ProductOptionNodeFragmentDoc = `
    fragment ProductOptionNode on ProductOption {
  id
  name
}
    `;
export const ProductNodeFragmentDoc = `
    fragment ProductNode on Product {
  id
  title
  handle
  totalInventory
  status
  updatedAt
  variantsCount {
    count
  }
  priceRangeV2 {
    maxVariantPrice {
      amount
      currencyCode
    }
    minVariantPrice {
      amount
      currencyCode
    }
  }
  compareAtPriceRange {
    maxVariantCompareAtPrice {
      amount
      currencyCode
    }
    minVariantCompareAtPrice {
      amount
      currencyCode
    }
  }
  options {
    ...ProductOptionNode
  }
}
    `;
export const ProductEdgesFragmentDoc = `
    fragment ProductEdges on ProductConnection {
  edges {
    node {
      ...ProductNode
    }
    cursor
  }
}
    `;
