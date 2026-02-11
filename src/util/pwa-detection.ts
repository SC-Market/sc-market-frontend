/**
 * PWA installation detection utilities
 */
/**
 * Check if the app is installed as a PWA
 * Works across iOS, Android, and desktop
 */
import CircularProgress from '@mui/material/CircularProgress';

import Box from '@mui/material/Box';
export function isPWAInstalled(): boolean {
  // Check for standalone mode (iOS Safari, Android Chrome, desktop)
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true
  }

  // Check for iOS Safari standalone mode (legacy)
  if ((window.navigator as any).standalone === true) {
    return true
  }

  // Check if running in a TWA (Trusted Web Activity) on Android
  // This is detected by checking if the referrer is empty and we're in standalone
  if (
    document.referrer === "" &&
    window.matchMedia("(display-mode: standalone)").matches
  ) {
    return true
  }

  return false
}

/**
 * Check if the device is mobile (iOS or Android)
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

/**
 * Check if push notifications require PWA installation
 * On mobile devices, push notifications only work if the PWA is installed
 */
export function requiresPWAInstallationForPush(): boolean {
  return isMobileDevice() && !isPWAInstalled()
}

/**
 * Get a user-friendly message about PWA installation requirement
 */
export function getPWAInstallationMessage(): string {
  if (!isMobileDevice()) {
    return ""
  }

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  const isAndroid = /Android/i.test(navigator.userAgent)

  if (isIOS) {
    return "To receive push notifications on iOS, please install this app by tapping the Share button and selecting 'Add to Home Screen'."
  }

  if (isAndroid) {
    return "To receive push notifications on Android, please install this app. Look for the install prompt or use the browser menu to 'Add to Home Screen'."
  }

  return "To receive push notifications on mobile, please install this app first."
}
