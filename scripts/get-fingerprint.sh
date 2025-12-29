#!/bin/bash
# Script to get SHA-256 fingerprint from keystore for Digital Asset Links

KEYSTORE_PATH="./android.keystore"
ALIAS="android"

if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "❌ Keystore not found at $KEYSTORE_PATH"
    exit 1
fi

echo "🔑 Getting SHA-256 fingerprint from keystore..."
echo "⚠️  You'll need to enter your keystore password"
echo ""

# Get the SHA-256 fingerprint (remove colons and convert to uppercase)
FINGERPRINT=$(keytool -list -v -keystore "$KEYSTORE_PATH" -alias "$ALIAS" 2>/dev/null | \
    grep -A 1 "SHA256:" | \
    grep "SHA256:" | \
    sed 's/.*SHA256: //' | \
    tr -d ':' | \
    tr '[:lower:]' '[:upper:]')

if [ -z "$FINGERPRINT" ]; then
    echo "❌ Failed to get fingerprint. Make sure you entered the correct password."
    exit 1
fi

echo "✅ SHA-256 Fingerprint:"
echo "$FINGERPRINT"
echo ""
echo "📋 Use this fingerprint in your assetlinks.json file:"
echo ""
cat << EOF
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "space.sc_market.twa",
      "sha256_cert_fingerprints": [
        "$FINGERPRINT"
      ]
    }
  }
]
EOF

echo ""
echo "📍 Save this as: https://sc-market.space/.well-known/assetlinks.json"
