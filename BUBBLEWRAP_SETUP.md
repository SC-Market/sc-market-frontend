# Bubblewrap Setup Guide for Play Store Deployment

This guide will help you set up Bubblewrap to convert the SC Market PWA into an Android app for the Google Play Store.

## Prerequisites

1. **Java Development Kit (JDK)**: Version 11 or higher
   - Check installation: `java -version`
   - Download: [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://openjdk.org/)

2. **Android SDK**: Required for building Android apps
   - Install Android Studio or just the command-line tools
   - Set `ANDROID_HOME` environment variable

3. **Node.js**: Already installed (required for the project)

4. **Google Play Developer Account**: Required for publishing to Play Store
   - Sign up at: https://play.google.com/console

## Installation

1. **Install dependencies**:
   ```bash
   yarn install
   ```

   This will install `@bubblewrap/cli` as a dev dependency.

2. **Verify Bubblewrap installation**:
   ```bash
   npx bubblewrap --version
   ```

## Initial Setup

### Step 1: Initialize the Android Project

If you're starting fresh, you can initialize Bubblewrap with the manifest:

```bash
yarn twa:init
```

This will prompt you for:
- Package ID (already set to `space.scmarket.app` in `twa-manifest.json`)
- App name (already set to "SC Market")
- Signing key information (if you don't have one yet)

**Note**: The `twa-manifest.json` file is already configured, so you can skip initialization if you prefer to use the existing configuration.

### Step 2: Create Signing Key (First Time Only)

If you don't have a signing key yet, you'll need to create one:

```bash
keytool -genkey -v -keystore android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000
```

**Important**: 
- Store the keystore file and password securely
- You'll need this key for all future updates
- Losing the key means you can't update the app on Play Store

The keystore path is already configured in `twa-manifest.json` as `./android.keystore`.

### Step 3: Update Configuration (If Needed)

Edit `twa-manifest.json` to adjust:
- `packageId`: Your app's unique package identifier
- `appVersionName`: Version string (e.g., "1.0.0")
- `appVersionCode`: Version number (increment for each release)
- Icon URLs: Ensure they're accessible
- `webManifestUrl`: Must point to your production manifest

## Digital Asset Links Setup

Before publishing, you need to set up Digital Asset Links to verify your app's relationship with your website.

### Step 1: Generate SHA-256 Fingerprint

Get your app's SHA-256 fingerprint:

```bash
yarn twa:build
```

After building, Bubblewrap will display the SHA-256 fingerprint. Save this value.

Alternatively, you can get it from the keystore:

```bash
keytool -list -v -keystore android.keystore -alias android
```

Look for the SHA-256 value in the certificate fingerprints.

### Step 2: Create Digital Asset Links File

Create a file at `https://sc-market.space/.well-known/assetlinks.json` with the following content:

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

Replace `YOUR_SHA256_FINGERPRINT_HERE` with your actual SHA-256 fingerprint (remove colons).

### Step 3: Verify Asset Links

1. Test the file is accessible:
   ```bash
   curl https://sc-market.space/.well-known/assetlinks.json
   ```

2. Use Google's verification tool:
   - Visit: https://developers.google.com/digital-asset-links/tools/generator
   - Enter your website URL and package name
   - Verify the connection

3. Validate with Bubblewrap:
   ```bash
   yarn twa:validate
   ```

## Building the Android App

### Build APK (for testing)

```bash
yarn twa:build
```

This will:
- Generate an Android project in the `twa/` directory
- Build an APK file
- Output the APK to `twa/app/build/outputs/apk/release/app-release-unsigned.apk`

### Sign the APK

If you need a signed APK for testing:

```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore android.keystore twa/app/build/outputs/apk/release/app-release-unsigned.apk android
```

Then align the APK:

```bash
zipalign -v 4 twa/app/build/outputs/apk/release/app-release-unsigned.apk app-release-signed.apk
```

### Build App Bundle (for Play Store)

For Play Store submission, you need an Android App Bundle (AAB):

```bash
cd twa
./gradlew bundleRelease
```

The AAB will be at: `twa/app/build/outputs/bundle/release/app-release.aab`

Sign the bundle:

```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore ../android.keystore twa/app/build/outputs/bundle/release/app-release.aab android
```

## Updating the App

When you need to update the app:

1. **Update version numbers** in `twa-manifest.json`:
   - Increment `appVersionCode` (e.g., 1 → 2)
   - Update `appVersionName` (e.g., "1.0.0" → "1.0.1")

2. **Update the TWA project**:
   ```bash
   yarn twa:update
   ```

3. **Rebuild**:
   ```bash
   yarn twa:build
   ```

4. **Build new bundle**:
   ```bash
   cd twa && ./gradlew bundleRelease
   ```

## Play Store Submission

### Step 1: Create App Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Fill in:
   - App name: "SC Market"
   - Default language: English
   - App or game: App
   - Free or paid: Free
   - Declarations: Complete all required sections

### Step 2: Upload App Bundle

1. Go to "Production" → "Create new release"
2. Upload the signed AAB file
3. Add release notes
4. Review and roll out

### Step 3: Complete Store Listing

Required information:
- **App icon**: Use `/android-chrome-512x512.png`
- **Feature graphic**: 1024 x 500 pixels
- **Screenshots**: At least 2 phone screenshots
- **Short description**: Up to 80 characters
- **Full description**: Detailed app description
- **Privacy Policy**: Required URL

### Step 4: Content Rating

Complete the content rating questionnaire. For SC Market:
- Category: Games
- Content: Generally suitable for all ages (unless your content suggests otherwise)

### Step 5: Pricing and Distribution

- Set as free app
- Select countries for distribution
- Complete data safety section

### Step 6: Review and Publish

1. Review all sections
2. Submit for review
3. Wait for Google's approval (typically 1-3 days)

## Troubleshooting

### Common Issues

1. **"Digital Asset Links verification failed"**
   - Ensure `/.well-known/assetlinks.json` is accessible
   - Verify the SHA-256 fingerprint matches
   - Check that the file is served with `Content-Type: application/json`

2. **"Keystore file not found"**
   - Ensure `android.keystore` exists in the project root
   - Or update the path in `twa-manifest.json`

3. **Build failures**
   - Ensure Android SDK is properly installed
   - Check `ANDROID_HOME` environment variable
   - Run `yarn twa:doctor` to diagnose issues

4. **Version code conflicts**
   - Each upload must have a unique, incrementing version code
   - Always increment `appVersionCode` in `twa-manifest.json`

### Validation and Diagnostics

Run diagnostics:

```bash
yarn twa:doctor
```

This will check:
- Java installation
- Android SDK setup
- Keystore configuration
- Manifest validity

## Maintenance

### Regular Updates

1. Update PWA features on the website
2. Increment version in `twa-manifest.json`
3. Run `yarn twa:update` and rebuild
4. Upload new bundle to Play Store

### Monitoring

- Monitor Play Store reviews and ratings
- Track app performance in Play Console
- Update app description and screenshots as needed
- Keep the PWA and Android app in sync

## Additional Resources

- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap)
- [Trusted Web Activity Guide](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Digital Asset Links](https://developers.google.com/digital-asset-links)
- [Play Store Publishing Guide](https://support.google.com/googleplay/android-developer/)

## Notes

- The `twa/` directory contains the generated Android project
- Add `twa/` to `.gitignore` if you don't want to commit it
- Keep `android.keystore` secure and backed up
- Never commit the keystore file to version control
