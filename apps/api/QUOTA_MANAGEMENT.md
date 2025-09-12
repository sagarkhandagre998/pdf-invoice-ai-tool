# API Quota Management

## Overview

This application uses Google's Gemini API for PDF invoice extraction. The free tier has limitations that you should be aware of.

## Free Tier Limits

- **50 requests per day** for Gemini 1.5 Flash model
- **24-hour reset period** (quota resets at midnight UTC)
- **No cost** for the first 50 requests

## Quota Exceeded Handling

When you exceed the quota limit, the application will:

1. **Return a 429 status code** with detailed error information
2. **Provide fallback data** structure instead of failing completely
3. **Cache results** to reduce API calls for identical PDFs
4. **Suggest upgrade options** and retry timing

## Error Response Format

When quota is exceeded, you'll receive:

```json
{
  "error": "API Quota Exceeded",
  "message": "Gemini API quota exceeded. You have reached the free tier limit of 50 requests per day.",
  "quotaInfo": {
    "isQuotaExceeded": true,
    "retryAfter": "24 hours",
    "suggestions": [
      "Wait until tomorrow for the free tier quota to reset",
      "Upgrade to a paid Gemini API plan for higher limits",
      "Implement request caching to reduce API calls"
    ],
    "upgradeUrl": "https://ai.google.dev/pricing"
  }
}
```

## Checking Quota Status

You can check your current quota status by calling:

```
GET /api/extract/quota
```

This will return information about your current usage and limits.

## Solutions for Higher Usage

### 1. Upgrade to Paid Plan
- Visit [Google AI Pricing](https://ai.google.dev/pricing)
- Choose a plan that fits your needs
- Update your API key in the environment variables

### 2. Implement Caching
The application already includes basic caching, but you can enhance it by:
- Using Redis for persistent caching
- Implementing file-based caching
- Adding database storage for extraction results

### 3. Multiple API Keys
- Use different API keys for different environments
- Rotate between keys to distribute load
- Implement key management system

### 4. Request Optimization
- Batch multiple PDFs when possible
- Implement retry logic with exponential backoff
- Use webhooks for async processing

## Environment Variables

Make sure you have the following environment variable set:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## Monitoring

The application logs quota-related events:
- Successful API calls
- Quota exceeded errors
- Fallback data usage
- Cache hits and misses

Check your application logs to monitor API usage patterns.

## Best Practices

1. **Monitor your usage** regularly
2. **Implement proper error handling** in your frontend
3. **Cache results** when possible
4. **Plan for quota limits** in your application design
5. **Consider upgrading** if you consistently hit limits

## Support

If you need help with quota management or upgrading your plan:
- Check the [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- Review [Google AI Pricing](https://ai.google.dev/pricing)
- Contact Google AI support for billing questions
