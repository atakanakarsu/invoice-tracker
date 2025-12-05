# Invoice Tracker - Production Deployment Guide

## Prerequisites
- Docker installed
- Git repository pushed to GitHub/GitLab
- Coolify or Repocloud account

## Environment Variables Required

```env
# Database (SQLite for simple setup, or use PostgreSQL URL)
DATABASE_URL="file:./prod.db"

# NextAuth Configuration
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key-32-chars-min"

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

## Deployment Steps

### Option 1: Coolify
1. Connect your Git repository
2. Select "Docker" as build method
3. Add environment variables above
4. Deploy!

### Option 2: Repocloud
1. Connect GitHub repository
2. It will auto-detect Dockerfile
3. Configure environment variables
4. Deploy!

### Option 3: Manual Docker
```bash
docker build -t invoice-tracker .
docker run -p 3000:3000 --env-file .env invoice-tracker
```

## Post-Deployment
1. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
2. Seed initial data (optional):
   ```bash
   npx prisma db seed
   ```

## SEO Blocking
`robots.txt` is already configured to block all search engines.

## Security Notes
- Change `NEXTAUTH_SECRET` to a strong random value
- Use HTTPS in production
- Configure Google OAuth redirect URIs to match your domain
