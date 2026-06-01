export const NATS_SUBJECTS = {
  orderCreated: 'order_created',
  paymentSuccess: 'payment_success',
  sendEmail: 'send_email'
} as const;

export type NatsSubject = (typeof NATS_SUBJECTS)[keyof typeof NATS_SUBJECTS];

export interface SendEmailEvent {
  type: 'welcome' | 'password_reset' | 'order_receipt';
  to: string;
  userId?: string;
  payload?: Record<string, unknown>;
}

export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  total: number;
  currency: string;
}

export interface PaymentSuccessEvent {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
}
