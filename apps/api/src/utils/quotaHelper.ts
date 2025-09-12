/**
 * Utility functions for managing API quota and providing user guidance
 */

export interface QuotaInfo {
  isQuotaExceeded: boolean;
  retryAfter?: string;
  suggestions: string[];
  upgradeUrl?: string;
}

export class QuotaHelper {
  /**
   * Get quota information and suggestions based on error type
   */
  static getQuotaInfo(error: Error): QuotaInfo {
    if (error.message.includes('429 Too Many Requests')) {
      return {
        isQuotaExceeded: true,
        retryAfter: '24 hours',
        suggestions: [
          'Wait until tomorrow for the free tier quota to reset (50 requests/day)',
          'Upgrade to a paid Gemini API plan for higher limits',
          'Implement request caching to reduce API calls',
          'Consider using multiple API keys for different environments'
        ],
        upgradeUrl: 'https://ai.google.dev/pricing'
      };
    }

    if (error.message.includes('API key')) {
      return {
        isQuotaExceeded: false,
        suggestions: [
          'Check your GEMINI_API_KEY environment variable',
          'Verify the API key is valid and active',
          'Ensure the API key has the necessary permissions'
        ]
      };
    }

    return {
      isQuotaExceeded: false,
      suggestions: [
        'Check your internet connection',
        'Verify the Gemini API service is available',
        'Try again in a few minutes'
      ]
    };
  }

  /**
   * Get current quota usage estimate (approximate)
   */
  static getQuotaUsageEstimate(): { used: number; limit: number; remaining: number } {
    // This is a rough estimate - in a real app, you'd track this properly
    const freeTierLimit = 50;
    const estimatedUsed = Math.floor(Math.random() * freeTierLimit); // Placeholder
    
    return {
      used: estimatedUsed,
      limit: freeTierLimit,
      remaining: freeTierLimit - estimatedUsed
    };
  }

  /**
   * Check if we should use fallback mode
   */
  static shouldUseFallback(error: Error): boolean {
    return error.message.includes('429 Too Many Requests') || 
           error.message.includes('quota') ||
           error.message.includes('limit');
  }
}
