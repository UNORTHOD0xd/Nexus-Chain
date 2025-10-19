# Sentry Error Tracking Setup

Guide for setting up Sentry error tracking in NexusChain.

## 🎯 Why Sentry?

Sentry provides:
- Real-time error tracking
- Performance monitoring
- Release tracking
- User context
- Stack traces
- Breadcrumbs (what led to the error)

## 🚀 Setup Instructions

### Step 1: Create Sentry Account

1. Go to [sentry.io](https://sentry.io/)
2. Sign up for free account
3. Create new project → Select "Node.js" for backend
4. Create another project → Select "Next.js" for frontend

### Step 2: Get DSN Keys

**Backend Project:**
1. Go to Settings → Projects → nexuschain-backend
2. Client Keys (DSN)
3. Copy DSN URL (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)

**Frontend Project:**
1. Go to Settings → Projects → nexuschain-frontend
2. Client Keys (DSN)
3. Copy DSN URL

### Step 3: Configure Backend

1. **Install Sentry SDK:**
   ```bash
   cd backend
   npm install @sentry/node @sentry/profiling-node
   ```

2. **Add to `.env`:**
   ```env
   SENTRY_DSN="https://your-backend-dsn@sentry.io/project-id"
   ```

3. **Update `server.js`:** (Already configured in the codebase)
   ```javascript
   import { initializeSentry, sentryErrorHandler } from './config/sentry.js';

   // Initialize Sentry (first middleware)
   initializeSentry(app);

   // ... your routes ...

   // Sentry error handler (before global error handler)
   app.use(sentryErrorHandler);
   ```

### Step 4: Configure Frontend

1. **Install Sentry SDK:**
   ```bash
   cd frontend
   npm install @sentry/nextjs
   ```

2. **Initialize Sentry:**
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

3. **Add to `.env.local`:**
   ```env
   NEXT_PUBLIC_SENTRY_DSN="https://your-frontend-dsn@sentry.io/project-id"
   SENTRY_ORG="your-org-slug"
   SENTRY_PROJECT="nexuschain-frontend"
   ```

4. **Files created by wizard:**
   - `sentry.client.config.js` - Frontend error tracking
   - `sentry.server.config.js` - API route error tracking
   - `sentry.edge.config.js` - Middleware error tracking

### Step 5: Test Error Tracking

**Backend Test:**
```javascript
// Add test endpoint in server.js
app.get('/api/test-error', (req, res) => {
  throw new Error('Test Sentry error tracking!');
});
```

Visit: `http://localhost:3000/api/test-error`

**Frontend Test:**
```jsx
// In any component
<button onClick={() => {
  throw new Error('Test frontend error!');
}}>
  Trigger Error
</button>
```

**Check Sentry Dashboard:**
1. Go to Issues tab
2. You should see the test errors
3. Click to view stack trace, breadcrumbs, context

### Step 6: Production Configuration

**Environment Variables (Production):**

Backend:
```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/backend-project-id
NODE_ENV=production
```

Frontend (Vercel):
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/frontend-project-id
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=nexuschain-frontend
SENTRY_AUTH_TOKEN=your-auth-token  # For source maps upload
```

---

## 📊 Sentry Features

### 1. Error Grouping
Sentry automatically groups similar errors together.

### 2. Releases
Track errors by deployment version:
```javascript
Sentry.init({
  release: process.env.npm_package_version || '1.0.0',
});
```

### 3. User Context
```javascript
Sentry.setUser({
  id: user.id,
  email: user.email,
  role: user.role,
});
```

### 4. Custom Tags
```javascript
Sentry.setTag('product_id', productId);
Sentry.setTag('blockchain_network', 'sepolia');
```

### 5. Breadcrumbs
```javascript
Sentry.addBreadcrumb({
  category: 'product',
  message: 'User registered product',
  level: 'info',
  data: { productId: 'PFZ-001' }
});
```

### 6. Performance Monitoring
```javascript
const transaction = Sentry.startTransaction({
  op: 'product.register',
  name: 'Register Product on Blockchain',
});

// ... your code ...

transaction.finish();
```

---

## 🔧 Advanced Configuration

### Filter Sensitive Data

Already configured in `backend/src/config/sentry.js`:

```javascript
beforeSend(event, hint) {
  // Remove passwords, tokens, etc.
  if (event.request?.headers) {
    delete event.request.headers.authorization;
    delete event.request.headers.cookie;
  }
  return event;
}
```

### Ignore Errors

```javascript
ignoreErrors: [
  'ECONNRESET',
  'ETIMEDOUT',
  'Non-Error promise rejection',
]
```

### Sample Rate (Production)

```javascript
// Only send 10% of errors to save quota
tracesSampleRate: 0.1,
```

---

## 📈 Monitoring Best Practices

### 1. Set Up Alerts

Go to Sentry → Alerts → Create Alert Rule:
- Alert on new issues
- Alert when issue frequency increases
- Alert on critical errors

### 2. Integrate with Slack/Discord

Settings → Integrations → Slack:
- Get notifications in your team channel
- Configure which events trigger notifications

### 3. Monitor Performance

- Track slow API endpoints
- Monitor database query times
- Identify bottlenecks

### 4. Review Weekly

- Check error trends
- Fix critical/high priority issues
- Archive resolved issues

---

## 💰 Pricing

**Free Tier:**
- 5,000 errors/month
- 10,000 performance units/month
- 1 member
- Good for MVP/small projects

**Team Plan ($26/month):**
- 50,000 errors/month
- 100,000 performance units
- Unlimited members

**Business Plan ($80/month):**
- 100,000 errors/month
- 500,000 performance units
- Advanced features

---

## 🐛 Troubleshooting

### Errors not showing in Sentry

1. **Check DSN is set:**
   ```bash
   echo $SENTRY_DSN
   ```

2. **Check initialization:**
   - Look for "Sentry error tracking initialized" in logs
   - Verify `initializeSentry()` is called

3. **Check network:**
   - Sentry SDK needs internet access
   - Check firewall rules

4. **Verify environment:**
   - Sentry is disabled in development by default
   - Set `NODE_ENV=production` to test

### Source maps not uploading

```bash
# Install Sentry CLI
npm install @sentry/cli

# Upload source maps
npx sentry-cli sourcemaps upload --org=your-org --project=your-project ./dist
```

---

## 📚 Resources

- [Sentry Node.js Docs](https://docs.sentry.io/platforms/node/)
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Best Practices](https://docs.sentry.io/product/best-practices/)

---

**Note:** Sentry configuration is **optional**. The app works fine without it, but you won't have error tracking in production.

**Last Updated:** 2025-10-19
**Maintainer:** UNORTHOD0xd
