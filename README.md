# Wanderlust AI - Travel Planner

An AI-powered travel planning application that helps create personalized itineraries.

## Environment Variables

Before running the application, you need to set up the following environment variables in a `.env` file:

```env
VITE_OPENAI_API_KEY=           # Your OpenAI API key
VITE_FIREBASE_API_KEY=         # Firebase API key
VITE_FIREBASE_AUTH_DOMAIN=     # Firebase auth domain
VITE_FIREBASE_PROJECT_ID=      # Firebase project ID
VITE_FIREBASE_STORAGE_BUCKET=  # Firebase storage bucket
VITE_FIREBASE_MESSAGING_SENDER_ID= # Firebase messaging sender ID
VITE_FIREBASE_APP_ID=          # Firebase app ID
```

## Development

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your API keys etc.
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

## Deployment

1. Ensure all environment variables are properly set in your deployment platform
2. Build the application: `npm run build`
3. Deploy the `dist` directory to your hosting service

## Security Notes

- Never commit `.env` files to version control
- Always use environment variables for sensitive data
- Keep API keys secure and rotate them regularly
- Use appropriate security rules in Firebase