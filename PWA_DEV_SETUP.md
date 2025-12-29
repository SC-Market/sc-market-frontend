# PWA Development Setup

## Service Worker in Development

The PWA service worker is enabled in development mode for testing. However, service workers have strict security requirements.

## Requirements

Service workers **require** one of the following:

1. **HTTPS** - Any HTTPS connection
2. **localhost** - `http://localhost` or `http://127.0.0.1`
3. **localhost variants** - `http://*.localhost` (e.g., `http://app.localhost`)

## Common Issues

### "The operation is insecure" Error

This error occurs when you're trying to access the app via:
- IP address (e.g., `http://192.168.1.100:5173`)
- Non-localhost domain (e.g., `http://mycomputer.local:5173`)

**Solution:** Always use `http://localhost:5173` or `http://127.0.0.1:5173` when testing PWA features.

### Service Worker Not Registering in Dev

If the service worker doesn't register immediately:
- Wait a few seconds after page load (Vite needs time to serve the dev service worker)
- Check the browser console for detailed error messages
- Verify you're accessing via `localhost` or `127.0.0.1`

## Testing PWA Features

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Access via localhost:**
   - ✅ `http://localhost:5173`
   - ✅ `http://127.0.0.1:5173`
   - ❌ `http://192.168.x.x:5173` (won't work)

3. **Check service worker:**
   - Open Chrome DevTools > Application > Service Workers
   - You should see the service worker registered

4. **Test offline:**
   - DevTools > Network > Check "Offline"
   - Refresh page - should show offline page or cached content

## WebSocket Connection Issues

If you see errors like:
- `NS_ERROR_WEBSOCKET_CONNECTION_REFUSED`
- `TypeError: can't access property "send", ws is undefined`

These are related to Vite's HMR (Hot Module Replacement) websocket, not the PWA service worker itself. The service worker registration will gracefully handle these errors and won't break your app.

**These errors are safe to ignore** - they just mean:
- The dev service worker can't use Vite's HMR features
- PWA features will still work, just without HMR in the service worker
- The service worker will register successfully once Vite's websocket is available

## Disabling PWA in Dev (if needed)

If you want to disable PWA features during development:

1. Set `devOptions.enabled: false` in `vite.config.ts`
2. Or comment out the `initPWA()` call in `src/index.tsx`

## Production Testing

For production-like testing:

1. Build the app: `npm run build`
2. Serve with HTTPS (required for service workers):
   ```bash
   # Using a tool like serve with HTTPS
   npx serve -s dist --ssl-cert cert.pem --ssl-key key.pem
   ```

3. Or use a tool like `local-ssl-proxy` to proxy to your dev server with HTTPS
