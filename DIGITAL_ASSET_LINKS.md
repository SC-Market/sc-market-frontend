# Digital Asset Links Setup

This file documents the server-side setup required for Digital Asset Links verification, which is necessary for the Android app to work properly with Trusted Web Activity (TWA).

## Required File

You need to create a file at the following location on your production server:

**Path**: `/.well-known/assetlinks.json`

**Full URL**: `https://sc-market.space/.well-known/assetlinks.json`

## File Content Template

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "space.scmarket.app",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT_HERE"
    ]
  }
}]
```

## Getting the SHA-256 Fingerprint

After building the Android app for the first time, you can get the SHA-256 fingerprint using one of these methods:

### Method 1: From Bubblewrap Build Output
When you run `yarn twa:build`, Bubblewrap will display the SHA-256 fingerprint in the output.

### Method 2: From Keystore
```bash
keytool -list -v -keystore android.keystore -alias android
```

Look for the "SHA256:" line in the certificate fingerprints section. Copy the value and remove all colons.

### Method 3: From APK/AAB
```bash
keytool -printcert -jarfile app-release.apk
```

## Server Configuration

### Nginx Configuration

If you're using Nginx, ensure the file is served with the correct content type:

```nginx
location /.well-known/assetlinks.json {
    add_header Content-Type application/json;
    add_header Access-Control-Allow-Origin *;
}
```

### Express/Node.js Configuration

If serving from Node.js, ensure proper headers:

```javascript
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, '.well-known/assetlinks.json'));
});
```

## Verification

1. **Test file accessibility**:
   ```bash
   curl https://sc-market.space/.well-known/assetlinks.json
   ```

2. **Check content type**:
   ```bash
   curl -I https://sc-market.space/.well-known/assetlinks.json
   ```
   Should show: `Content-Type: application/json`

3. **Use Google's tool**:
   - Visit: https://developers.google.com/digital-asset-links/tools/generator
   - Enter: `https://sc-market.space` and `space.scmarket.app`
   - Verify the connection

4. **Validate with Bubblewrap**:
   ```bash
   yarn twa:validate
   ```

## Important Notes

- The fingerprint must match exactly (no colons, uppercase)
- The file must be accessible via HTTPS
- The file must be served with `Content-Type: application/json`
- If you change the signing key, you must update the fingerprint
- Multiple fingerprints can be added for different build variants

## Troubleshooting

**Issue**: "Digital Asset Links verification failed"

**Solutions**:
1. Verify the file is accessible: `curl https://sc-market.space/.well-known/assetlinks.json`
2. Check the SHA-256 fingerprint matches exactly
3. Ensure the file is served with correct content type
4. Verify the package name matches: `space.scmarket.app`
5. Wait a few minutes after uploading - Google caches the file
