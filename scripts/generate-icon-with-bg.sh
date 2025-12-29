#!/bin/bash
# Script to generate icon versions with background color for Android TWA

BG_COLOR="#111828"
INPUT_192="public/android-chrome-192x192.png"
INPUT_512="public/android-chrome-512x512.png"
OUTPUT_192="public/android-chrome-192x192-bg.png"
OUTPUT_512="public/android-chrome-512x512-bg.png"

echo "🎨 Generating icons with background color: $BG_COLOR"
echo ""

# Check if input files exist
if [ ! -f "$INPUT_192" ]; then
    echo "❌ Input file not found: $INPUT_192"
    exit 1
fi

if [ ! -f "$INPUT_512" ]; then
    echo "❌ Input file not found: $INPUT_512"
    exit 1
fi

# Check if ImageMagick is available
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick (convert) not found. Please install it:"
    echo "   brew install imagemagick"
    exit 1
fi

echo "📐 Generating 192x192 icon with background..."
convert "$INPUT_192" \
    -background "$BG_COLOR" \
    -alpha remove \
    -alpha off \
    -compose over \
    -flatten \
    "$OUTPUT_192"

if [ $? -eq 0 ]; then
    echo "✅ Created: $OUTPUT_192"
else
    echo "❌ Failed to create 192x192 icon"
    exit 1
fi

echo ""
echo "📐 Generating 512x512 icon with background..."
convert "$INPUT_512" \
    -background "$BG_COLOR" \
    -alpha remove \
    -alpha off \
    -compose over \
    -flatten \
    "$OUTPUT_512"

if [ $? -eq 0 ]; then
    echo "✅ Created: $OUTPUT_512"
else
    echo "❌ Failed to create 512x512 icon"
    exit 1
fi

echo ""
echo "✅ Successfully generated icons with background!"
echo ""
echo "📝 Next steps:"
echo "   1. Update twa-manifest.json to use the new icons:"
echo "      - iconUrl: \"https://sc-market.space/android-chrome-512x512-bg.png\""
echo "      - maskableIconUrl: \"https://sc-market.space/android-chrome-512x512-bg.png\""
echo "   2. Rebuild the app: npm run twa:build"
echo "   3. Reinstall: npm run twa:install"
