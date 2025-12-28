/**
 * Custom error class for payment-related errors
 */
export class PaymentError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    Object.setPrototypeOf(this, PaymentError.prototype);
  }
}

// Common error codes in the payment system
export const PaymentErrorCode = {
  AUTHENTICATION: 'authentication',
  USER_NOT_FOUND: 'user-not-found',
  INVALID_INPUT: 'invalid-input',
  CONFIGURATION: 'configuration',
  API_ERROR: 'api-error',
  API_RESPONSE: 'api-response',
  WEBHOOK_INVALID: 'webhook-invalid',
  SUBSCRIPTION_ERROR: 'subscription-error',
  CUSTOMER_PORTAL_ERROR: 'customer-portal-error',
  UNKNOWN: 'unknown',
} as const;






