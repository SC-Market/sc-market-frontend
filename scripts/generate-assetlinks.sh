#!/bin/bash
# Script to generate assetlinks.json with the correct SHA-256 fingerprint

PACKAGE_ID="space.sc_market.twa"
KEYSTORE_PATH="./android.keystore"
KEYSTORE_ALIAS="android"
OUTPUT_FILE="./public/.well-known/assetlinks.json"

# Check if keystore exists
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "❌ Keystore not found at: $KEYSTORE_PATH"
    exit 1
fi

echo "🔐 Getting SHA-256 fingerprint from keystore..."

# Check if password is provided via environment variable
if [ -n "$KEYSTORE_PASSWORD" ]; then
    echo "   Using password from KEYSTORE_PASSWORD environment variable"
    # Extract SHA256 fingerprint, remove colons and spaces, convert to lowercase
    # Format: "SHA256: C2:E4:E6:03:..." -> "c2e4e603..."
    FINGERPRINT=$(keytool -list -v -keystore "$KEYSTORE_PATH" -alias "$KEYSTORE_ALIAS" -storepass "$KEYSTORE_PASSWORD" 2>&1 | grep -i "SHA256:" | sed 's/.*SHA256: //')
else
    # Prompt for password if not in environment
    echo -n "   Enter keystore password: "
    read -s KEYSTORE_PASS
    echo ""
    # Extract SHA256 fingerprint, remove colons and spaces, convert to lowercase
    # Format: "SHA256: C2:E4:E6:03:..." -> "c2e4e603..."
    FINGERPRINT=$(keytool -list -v -keystore "$KEYSTORE_PATH" -alias "$KEYSTORE_ALIAS" -storepass "$KEYSTORE_PASS" 2>&1 | grep -i "SHA256:" | sed 's/.*SHA256: //')
fi

if [ -z "$FINGERPRINT" ]; then
    echo ""
    echo "❌ Failed to get fingerprint. Possible reasons:"
    echo "   1. Incorrect keystore password"
    echo "   2. The alias '$KEYSTORE_ALIAS' doesn't exist in the keystore"
    echo "   3. The keystore file is corrupted"
    exit 1
fi

echo "✅ Found fingerprint: $FINGERPRINT"
echo "   (Format: lowercase, no colons - ready for Digital Asset Links)"
echo ""

# Create the assetlinks.json content
cat > "$OUTPUT_FILE" << EOF
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "$PACKAGE_ID",
      "sha256_cert_fingerprints": [
        "$FINGERPRINT"
      ]
    }
  }
]
EOF

echo "✅ Generated $OUTPUT_FILE"
echo ""
echo "📝 Next steps:"
echo "   1. Review the generated file"
echo "   2. Commit and push to deploy to Cloudflare Pages"
echo "   3. Verify it's accessible at: https://sc-market.space/.well-known/assetlinks.json"
echo ""
echo "🔍 To verify after deployment:"
echo "   curl https://sc-market.space/.well-known/assetlinks.json"
