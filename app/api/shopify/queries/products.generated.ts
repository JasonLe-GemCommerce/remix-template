import type * as Types from "../../../schemas/shopify/admin.types";

import {
  ProductEdgesFragmentDoc,
  ProductNodeFragmentDoc,
  ProductOptionNodeFragmentDoc,
} from "../fragments/product.generated";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { appFetcherGemX } from "../../utils";
export type ProductsQueryVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  after?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  query?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type ProductsQueryResponse = {
  products: {
    pageInfo: Pick<Types.PageInfo, "hasNextPage" | "startCursor" | "endCursor">;
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
};

export const ProductsDocument = `
    query products($first: Int, $after: String, $query: String) {
  products(first: $first, after: $after, query: $query) {
    ...ProductEdges
    pageInfo {
      hasNextPage
      startCursor
      endCursor
    }
  }
}
    ${ProductEdgesFragmentDoc}
${ProductNodeFragmentDoc}
${ProductOptionNodeFragmentDoc}`;

export const useProductsQuery = <
  TData = ProductsQueryResponse,
  TError = unknown,
>(
  variables?: ProductsQueryVariables,
  options?: UseQueryOptions<ProductsQueryResponse, TError, TData>,
) => {
  return useQuery<ProductsQueryResponse, TError, TData>(
    variables === undefined ? ["products"] : ["products", variables],
    appFetcherGemX<ProductsQueryResponse, ProductsQueryVariables>(
      ProductsDocument,
      variables,
    ),
    options,
  );
};

useProductsQuery.getKey = (variables?: ProductsQueryVariables) =>
  variables === undefined ? ["products"] : ["products", variables];
