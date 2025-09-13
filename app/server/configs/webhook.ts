import type {
  WebhookSubscriptionInput,
  WebhookSubscriptionTopic,
} from '~/schemas/shopify/admin.types';

export interface IWebhookTopic extends WebhookSubscriptionInput {
  topic: WebhookSubscriptionTopic;
}

export const WEBHOOK_TOPICS: IWebhookTopic[] = [
  {
    topic: 'APP_UNINSTALLED',
    callbackUrl: `webhooks/app/uninstalled`,
    format: 'JSON',
  },
  {
    topic: 'APP_SCOPES_UPDATE',
    callbackUrl: `webhooks/app/scopes_update`,
    format: 'JSON',
  },
];
