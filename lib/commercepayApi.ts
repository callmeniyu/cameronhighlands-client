/**
 * CommercePay API Client (Frontend)
 * Handles communication with backend CommercePay endpoints
 */

/**
 * API Response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  code?: string;
  retryAfter?: number;
}

/**
 * Payment Session Response
 */
export interface PaymentSessionResponse {
  redirectUrl: string;
  referenceCode: string;
  sessionId: string;
  expiresAt: string;
}

export interface CommercePayChannel {
  channelId?: string | number;
  id?: string | number;
  value?: string | number;
  providerChannelId?: string;
  providerChannelCode?: string;
  providerId?: string;
  displayName?: string;
  channelName?: string;
  name?: string;
  [key: string]: any;
}

/**
 * Payment Status Response
 */
export interface PaymentStatusResponse {
  status: 'succeeded' | 'failed' | 'pending' | 'unknown';
  paymentChannel: string;
  bookingStatus: string;
  amount: number;
  currency: string;
}

/**
 * CommercePay API Client
 */
export class CommercePayApi {
  private get baseUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    // Strip trailing slash if exists to avoid double slashes
    const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    return `${cleanApiUrl}/api/payment/commercepay`;
  }
  
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_COMMERCEPAY_API_KEY || '';
  }

  /**
   * Make HTTP request with error handling
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    options?: { retries?: number; timeout?: number }
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const retries = options?.retries ?? 3;
    const timeout = options?.timeout ?? 30000;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
          return {
            success: false,
            message: 'Too many requests',
            code: 'RATE_LIMITED',
            retryAfter,
            error: 'Please try again later',
          };
        }

        // Parse response
        let data: any;
        try {
          data = await response.json();
        } catch {
          data = { success: false, message: 'Invalid response from server' };
        }

        // Return response regardless of status code
        // Let caller handle HTTP errors
        if (!response.ok) {
          console.warn(`[CommercePay API] HTTP ${response.status}:`, data);
        }

        return data as ApiResponse<T>;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on specific errors
        if (lastError.message.includes('Invalid')) {
          throw lastError;
        }

        // Retry logic with exponential backoff
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Request failed after ${retries} retries: ${lastError?.message}`);
  }

  /**
   * Create payment session
   * Initiates a new CommercePay payment session
   */
  async createPaymentSession(bookingData: {
    bookingId: string;
    packageName: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    currency?: string;
    channelId?: string | number;
    providerChannelId?: string;
    packageType?: string;
    packageId?: string;
    [key: string]: any;
  }): Promise<ApiResponse<PaymentSessionResponse>> {
    try {
      // Validate input
      if (!bookingData.bookingId) {
        throw new Error('bookingId is required');
      }
      if (!bookingData.amount || bookingData.amount <= 0) {
        throw new Error('Valid amount is required');
      }

      const { channelId, providerChannelId, ...bookingDataWithoutChannels } = bookingData;

      const requestBody: any = {
        bookingData: bookingDataWithoutChannels,
        amount: bookingData.amount,
        currency: bookingData.currency || 'MYR',
      };

      if (channelId !== undefined && channelId !== null && String(channelId).trim() !== '') {
        const rawChannelId = String(channelId).trim();
        const parsedChannelId = Number(rawChannelId);
        requestBody.channelId = Number.isNaN(parsedChannelId) ? rawChannelId : parsedChannelId;
      }

      if (providerChannelId && String(providerChannelId).trim() !== '') {
        requestBody.providerChannelId = providerChannelId;
      }

      const response = await this.request<PaymentSessionResponse>(
        'POST',
        '/create-session',
        requestBody,
        { retries: 2, timeout: 30000 }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to create payment session');
      }

      if (!response.data?.redirectUrl) {
        throw new Error('No redirect URL in response');
      }

      return response;
    } catch (error) {
      console.error('[CommercePay API] createPaymentSession error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create payment session',
        code: 'SESSION_CREATION_FAILED',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Fetch available payment channels by country
   */
  async getAvailableChannels(countryCode: string = 'MY'): Promise<ApiResponse<CommercePayChannel[]>> {
    try {
      const response = await this.request<CommercePayChannel[]>(
        'GET',
        `/channels?countryCode=${encodeURIComponent(countryCode)}`,
        undefined,
        { retries: 2, timeout: 20000 }
      );

      return response;
    } catch (error) {
      console.error('[CommercePay API] getAvailableChannels error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch channels',
        code: 'CHANNEL_FETCH_FAILED',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Handle payment callback
   * Called when user returns from CommercePay payment page
   */
  async handlePaymentCallback(transactionNumber: string, referenceCode: string): Promise<ApiResponse> {
    try {
      if (!transactionNumber || !referenceCode) {
        throw new Error('transactionNumber and referenceCode are required');
      }

      const response = await this.request(
        'POST',
        '/callback',
        {
          transactionNumber,
          referenceCode,
        },
        { retries: 3, timeout: 30000 }
      );

      return response;
    } catch (error) {
      console.error('[CommercePay API] handlePaymentCallback error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process callback',
        code: 'CALLBACK_FAILED',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Verify payment status
   * Query the payment status from backend
   */
  async verifyPaymentStatus(referenceCode: string): Promise<ApiResponse<PaymentStatusResponse>> {
    try {
      if (!referenceCode) {
        throw new Error('referenceCode is required');
      }

      const response = await this.request<PaymentStatusResponse>(
        'GET',
        `/status/${encodeURIComponent(referenceCode)}`,
        undefined,
        { retries: 2, timeout: 15000 }
      );

      return response;
    } catch (error) {
      console.error('[CommercePay API] verifyPaymentStatus error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify payment status',
        code: 'STATUS_VERIFICATION_FAILED',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Cancel payment
   * Cancel an ongoing payment session
   */
  async cancelPayment(referenceCode: string): Promise<ApiResponse> {
    try {
      if (!referenceCode) {
        throw new Error('referenceCode is required');
      }

      const response = await this.request(
        'POST',
        '/cancel',
        {
          referenceCode,
        },
        { retries: 2, timeout: 15000 }
      );

      return response;
    } catch (error) {
      console.error('[CommercePay API] cancelPayment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel payment',
        code: 'CANCELLATION_FAILED',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Poll payment status
   * Repeatedly check payment status until completion or timeout
   */
  async pollPaymentStatus(
    referenceCode: string,
    maxAttempts: number = 30,
    intervalMs: number = 2000
  ): Promise<ApiResponse<PaymentStatusResponse>> {
    try {
      if (!referenceCode) {
        throw new Error('referenceCode is required');
      }

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const response = await this.verifyPaymentStatus(referenceCode);

        if (response.data?.status === 'succeeded') {
          return response;
        }

        if (response.data?.status === 'failed') {
          return response;
        }

        // Wait before next attempt
        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, intervalMs));
        }
      }

      return {
        success: false,
        message: 'Payment status check timed out',
        code: 'STATUS_TIMEOUT',
      };
    } catch (error) {
      console.error('[CommercePay API] pollPaymentStatus error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment status polling failed',
        code: 'POLLING_FAILED',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Format payment amount for display
   */
  static formatAmount(amount: number): string {
    const amountInRinggit = amount.toFixed(2);
    return `RM ${amountInRinggit}`;
  }

  /**
   * Parse status code to user-friendly message
   */
  static getStatusMessage(status: string): string {
    const messages: Record<string, string> = {
      succeeded: 'Payment successful! Your booking is confirmed.',
      failed: 'Payment failed. Please try again or use a different payment method.',
      pending: 'Payment is processing. Please wait...',
      unknown: 'Payment status is unknown. Please contact support.',
    };

    return messages[status] || 'Payment status unavailable';
  }
}

/**
 * Create singleton instance
 */
let instance: CommercePayApi | null = null;

/**
 * Get or create CommercePay API client instance
 */
export function getCommercePayApi(): CommercePayApi {
  if (!instance) {
    instance = new CommercePayApi();
  }
  return instance;
}

/**
 * Export factory
 */
export const commercePayApi = {
  createSession: (data: Parameters<CommercePayApi['createPaymentSession']>[0]) =>
    getCommercePayApi().createPaymentSession(data),
  getAvailableChannels: (countryCode?: string) =>
    getCommercePayApi().getAvailableChannels(countryCode),
  handleCallback: (transactionNumber: string, referenceCode: string) =>
    getCommercePayApi().handlePaymentCallback(transactionNumber, referenceCode),
  checkStatus: (referenceCode: string) => getCommercePayApi().verifyPaymentStatus(referenceCode),
  cancel: (referenceCode: string) => getCommercePayApi().cancelPayment(referenceCode),
  pollStatus: (
    referenceCode: string,
    maxAttempts?: number,
    intervalMs?: number
  ) => getCommercePayApi().pollPaymentStatus(referenceCode, maxAttempts, intervalMs),
  formatAmount: CommercePayApi.formatAmount,
  getStatusMessage: CommercePayApi.getStatusMessage,
};

export default CommercePayApi;
