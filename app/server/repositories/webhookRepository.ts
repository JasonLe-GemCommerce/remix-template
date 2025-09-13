import type { WebhookSubscriptionNodeFragment } from "~/api/shopify/fragments/webhookSubscription.generated";
import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import type { IWebhookTopic } from "../configs/webhook";

import { WebhookSubscriptionCreateDocument } from "~/api/shopify/mutations/webhookSubscriptionCreate.generated";
import { WebhookSubscriptionsDocument } from "~/api/shopify/queries/webhookSubscriptions.generated";
import { sentryCaptureException } from "~/exceptions/sentry";

interface WebhookHttpEndpointNode extends WebhookSubscriptionNodeFragment {
  endpoint: {
    __typename: "WebhookHttpEndpoint";
    callbackUrl: string;
  };
}

export class WebhookRepository {
  private admin: AdminApiContext;
  private shopifyAppUrl: string;

  constructor(admin: AdminApiContext, shopifyAppUrl: string) {
    this.admin = admin;
    this.shopifyAppUrl = shopifyAppUrl;
  }

  async getExistingWebhooks(): Promise<WebhookHttpEndpointNode[]> {
    try {
      const response = await this.admin.graphql(
        `#graphql ${WebhookSubscriptionsDocument}`,
      );
      const data = await response.json();
      return (
        data?.data?.webhookSubscriptions?.edges.map((edge: any) => edge.node) ||
        []
      );
    } catch (error) {
      sentryCaptureException(
        "WebhookRepository - getExistingWebhooks",
        (error as Error).message,
        { error },
        { level: "error" },
      );
      throw error;
    }
  }

  async createWebhook(webhookConfig: IWebhookTopic): Promise<string> {
    const { topic, callbackUrl, format } = webhookConfig;

    try {
      const desiredCallbackUrl = `${this.shopifyAppUrl}${callbackUrl}`;
      const variables = {
        topic,
        webhookSubscription: {
          callbackUrl: desiredCallbackUrl,
          format,
        },
      };

      const response = await this.admin.graphql(
        `#graphql ${WebhookSubscriptionCreateDocument}`,
        {
          variables,
        },
      );
      const data = await response.json();
      const dataWebhook = data?.data;

      const userErrors =
        dataWebhook?.webhookSubscriptionCreate?.userErrors || [];
      if (userErrors.length > 0) {
        throw new Error(userErrors[0].message);
      }

      const webhookId =
        dataWebhook?.webhookSubscriptionCreate?.webhookSubscription?.id;
      if (!webhookId) {
        throw new Error("Failed to create webhook subscription");
      }

      return webhookId;
    } catch (error) {
      sentryCaptureException(
        `WebhookRepository - createWebhook - ${topic}`,
        (error as Error).message,
        { topic, callbackUrl, error },
        { level: "error" },
      );
      throw error;
    }
  }

  async webhookExists(
    webhookConfig: IWebhookTopic,
    existingWebhooks: WebhookHttpEndpointNode[],
  ): Promise<boolean> {
    const { topic, callbackUrl, format } = webhookConfig;
    const desiredCallbackUrl = `${this.shopifyAppUrl}${callbackUrl}`;
    return existingWebhooks.some(
      (webhook) =>
        webhook.topic === topic &&
        webhook.endpoint?.callbackUrl === desiredCallbackUrl &&
        webhook.format === format,
    );
  }
}
