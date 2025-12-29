#!/bin/bash
# Script to open SC Market TWA app on connected Android device

PACKAGE_ID="space.sc_market.twa"

# Check if device is connected
if ! adb devices | grep -q "device$"; then
    echo "❌ No Android device connected. Please connect a device and enable USB debugging."
    exit 1
fi

echo "📱 Opening SC Market app..."
adb shell am start -n "$PACKAGE_ID/.LauncherActivity" || \
adb shell monkey -p "$PACKAGE_ID" -c android.intent.category.LAUNCHER 1

if [ $? -eq 0 ]; then
    echo "✅ App opened successfully!"
else
    echo "❌ Failed to open app. Trying alternative method..."
    # Alternative: use intent
    adb shell am start -a android.intent.action.MAIN -c android.intent.category.LAUNCHER -n "$PACKAGE_ID/.LauncherActivity"
fi
