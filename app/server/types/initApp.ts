export interface ShopifyUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  account_owner: boolean;
  locale: string;
  collaborator: boolean;
  email_verified: boolean;
}

export interface Session {
  session_id: string;
  shopify_domain: string;
  shopify_user: ShopifyUser;
}

export interface ShopifyData {
  session: Session;
  shopify_id?: number;
  shopify_domain: string;
  shopify_token: string;
  expired: number;
  userHash: string;
}
