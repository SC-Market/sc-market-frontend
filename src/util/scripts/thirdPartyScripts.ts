/**
 * Utility for loading third-party scripts with optimal performance characteristics.
 * 
 * This module provides functions to load external scripts with async/defer attributes
 * to prevent blocking the critical rendering path.
 * 
 * Requirements: 7.1 - Configure async/defer for third-party scripts
 */
import Box from '@mui/material/Box';

import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MaterialLink from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import PeopleAltRounded from '@mui/icons-material/PeopleAltRounded';
import PrivacyTipRounded from '@mui/icons-material/PrivacyTipRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import Block from '@mui/icons-material/Block';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import NotificationsActiveRounded from '@mui/icons-material/NotificationsActiveRounded';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidRounded from '@mui/icons-material/PhoneAndroidRounded';
import NoteAddRounded from '@mui/icons-material/NoteAddRounded';

export interface ScriptLoadOptions {
  /**
   * Whether to load the script asynchronously (downloads in parallel, executes when ready)
   */
  async?: boolean
  
  /**
   * Whether to defer script execution until after document parsing
   */
  defer?: boolean
  
  /**
   * Callback when script loads successfully
   */
  onLoad?: () => void
  
  /**
   * Callback when script fails to load
   */
  onError?: (error: Error) => void
  
  /**
   * Additional attributes to add to the script tag
   */
  attributes?: Record<string, string>
}

/**
 * Load a third-party script with async/defer attributes to prevent blocking.
 * 
 * @param src - The URL of the script to load
 * @param options - Configuration options for script loading
 * @returns Promise that resolves when script loads or rejects on error
 * 
 * @example
 * // Load analytics script asynchronously
 * loadScript('https://www.googletagmanager.com/gtag/js?id=GA_ID', {
 *   async: true,
 *   onLoad: () => console.log('Analytics loaded'),
 *   onError: (err) => console.error('Analytics failed', err)
 * })
 */
export function loadScript(
  src: string,
  options: ScriptLoadOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${src}"]`)
    if (existingScript) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    
    // Set async/defer attributes
    if (options.async) {
      script.async = true
    }
    if (options.defer) {
      script.defer = true
    }
    
    // Add custom attributes
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        script.setAttribute(key, value)
      })
    }
    
    // Handle load success
    script.onload = () => {
      options.onLoad?.()
      resolve()
    }
    
    // Handle load failure
    script.onerror = () => {
      const error = new Error(`Failed to load script: ${src}`)
      options.onError?.(error)
      reject(error)
    }
    
    // Append to document
    document.head.appendChild(script)
  })
}

/**
 * Load multiple scripts in sequence with async/defer attributes.
 * 
 * @param scripts - Array of script configurations
 * @returns Promise that resolves when all scripts load
 * 
 * @example
 * loadScriptsSequentially([
 *   { src: 'https://example.com/lib1.js', async: true },
 *   { src: 'https://example.com/lib2.js', async: true }
 * ])
 */
export async function loadScriptsSequentially(
  scripts: Array<{ src: string; options?: ScriptLoadOptions }>
): Promise<void> {
  for (const { src, options } of scripts) {
    await loadScript(src, options)
  }
}

/**
 * Load multiple scripts in parallel with async attributes.
 * 
 * @param scripts - Array of script configurations
 * @returns Promise that resolves when all scripts load
 * 
 * @example
 * loadScriptsParallel([
 *   { src: 'https://example.com/lib1.js', async: true },
 *   { src: 'https://example.com/lib2.js', async: true }
 * ])
 */
export async function loadScriptsParallel(
  scripts: Array<{ src: string; options?: ScriptLoadOptions }>
): Promise<void> {
  await Promise.all(
    scripts.map(({ src, options }) => loadScript(src, options))
  )
}

/**
 * Remove a loaded script from the document.
 * 
 * @param src - The URL of the script to remove
 */
export function removeScript(src: string): void {
  const script = document.querySelector(`script[src="${src}"]`)
  if (script) {
    script.remove()
  }
}
