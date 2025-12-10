# Instructions for Getting a New Google API Key

If you've encountered a rate limit error with the Google Gemini API or need to get a new API key for any reason, follow these steps:

## Step-by-Step Guide

### 1. Create a Google Cloud Account
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Sign in with your Google account or create a new one
- Accept the terms of service if prompted

### 2. Create a New Project
- Click on the project dropdown at the top of the page
- Click "New Project"
- Enter a project name (e.g., "TravelEase")
- Click "Create"

### 3. Enable the Generative Language API
- In the left sidebar, click "APIs & Services" > "Library"
- Search for "Generative Language API"
- Click on "Generative Language API" in the search results
- Click the "Enable" button

### 4. Create an API Key
- In the left sidebar, click "APIs & Services" > "Credentials"
- Click "Create Credentials" > "API Key"
- Your new API key will be displayed
- Click "Copy" to copy the key to your clipboard
- Click "Close"

### 5. Restrict Your API Key (Recommended for Security)
- Click the pencil icon next to your newly created API key
- Under "Application restrictions", select "HTTP referrers (websites)" if you're using it for a web application
- Under "API restrictions", select "Restrict key" and check "Generative Language API"
- Click "Save"

### 6. Update Your Environment Variables
- Locate your `.env.local` file in the TravelEase project root directory
- Replace the existing API key value with your new key:
```
VITE_GEMINI_API_KEY=your_new_api_key_here
```
- Save the file

### 7. Restart Your Development Server
- Stop your current development server (Ctrl+C)
- Start it again with `npm run dev` or your project's start command

## Understanding Rate Limits

The free tier of the Google Gemini API has the following limits:
- 15 requests per minute
- 1,500 requests per day

If you exceed these limits, you'll receive a rate limit error. The limits reset daily at midnight Pacific Time.

## Upgrading Your Account

If you need higher rate limits for production use:
- Go to the [Google Cloud Billing](https://console.cloud.google.com/billing) page
- Set up a billing account
- Upgrade your project to use the billing account
- This will give you access to higher rate limits

## Troubleshooting

### API Key Not Working
- Ensure you've enabled the Generative Language API for your project
- Check that your API key is correctly copied to your `.env.local` file
- Verify there are no extra spaces or characters in the key

### Still Getting Rate Limit Errors
- Wait until the daily quota resets (midnight Pacific Time)
- Check that you're using the correct model name ("gemini-1.5-flash")
- Consider upgrading your Google Cloud account for higher quotas

## Security Best Practices

- Never commit your API key to version control
- Use environment variables to store your API key
- Regularly rotate your API keys
- Apply appropriate restrictions to your API keys
- Monitor your API usage in the Google Cloud Console

By following these instructions, you should be able to get a new API key and continue using the TravelEase application without rate limit issues.