# Tauri Desktop Setup

SC Market now supports desktop applications for **macOS**, **Windows**, and **Linux** using Tauri 2.0.

## Prerequisites

- **Rust**: Install from [rustup.rs](https://rustup.rs/)
- **Node.js**: Already installed
- **Platform-specific dependencies**:
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Windows**: Microsoft Visual Studio C++ Build Tools
  - **Linux**: See [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

## Development

Run the desktop app in development mode:

```bash
npm run tauri:dev
```

This will:
1. Start Vite dev server on `localhost:5173`
2. Launch Tauri window with your React app
3. Enable hot-reload for frontend changes

## Building

Build desktop installers for your platform:

```bash
npm run tauri:build
```

Output will be in `src-tauri/target/release/bundle/`:
- **macOS**: `.dmg` file
- **Windows**: `.msi` installer
- **Linux**: `.deb` and `.AppImage` files

## Architecture

- **Frontend**: Your existing React + Vite app (unchanged)
- **Backend**: Minimal Rust wrapper that serves the static site
- **API**: Still connects to your Node.js backend via HTTP

## What's Included

- ✅ Desktop window configuration (1280x800, resizable)
- ✅ App icons for all platforms
- ✅ Shell plugin (for opening URLs)
- ✅ Basic security configuration

## Next Steps

To add Tauri-specific features:

1. **System Tray**: Add `tauri-plugin-tray`
2. **Global Shortcuts**: Add `tauri-plugin-global-shortcut`
3. **Notifications**: Add `tauri-plugin-notification`
4. **File System**: Add `tauri-plugin-fs`

See [Tauri Plugins](https://v2.tauri.app/plugin/) for full list.

## Notes

- Your PWA and web app continue to work unchanged
- Desktop app connects to the same backend API
- No code changes needed in your React app
- Both can coexist - users choose their preferred platform
