/**
 * Optimized Bugsnag loader that doesn't block critical rendering path.
 * 
 * This module provides async initialization of Bugsnag with error boundary fallback.
 * 
 * Requirements: 7.4 - Optimize Bugsnag loading
 */

import React from 'react'
import { onPageInteractive } from '../scripts/delayedScriptLoader'

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

let bugsnagInitialized = false
let bugsnagInstance: any = null
let bugsnagReactPlugin: any = null

/**
 * Initialize Bugsnag asynchronously after page is interactive.
 * 
 * @param apiKey - Bugsnag API key
 * @returns Promise that resolves when Bugsnag is initialized
 */
export async function initializeBugsnagAsync(apiKey: string): Promise<void> {
  if (bugsnagInitialized) {
    return
  }

  return new Promise((resolve) => {
    // Delay Bugsnag initialization until page is interactive
    onPageInteractive(async () => {
      try {
        // Dynamically import Bugsnag modules
        const [Bugsnag, BugsnagPluginReact, BugsnagPerformance] = await Promise.all([
          import('@bugsnag/js'),
          import('@bugsnag/plugin-react'),
          import('@bugsnag/browser-performance'),
        ])

        // Initialize Bugsnag
        bugsnagInstance = Bugsnag.default.start({
          apiKey,
          plugins: [new BugsnagPluginReact.default()],
        })

        // Initialize Bugsnag Performance
        BugsnagPerformance.default.start({
          apiKey,
        })

        bugsnagReactPlugin = bugsnagInstance.getPlugin('react')
        bugsnagInitialized = true
        
        resolve()
      } catch (error) {
        // Silently fail - error monitoring is not critical for app functionality
        if (import.meta.env.DEV) {
          console.warn('Bugsnag initialization failed (non-critical):', error)
        }
        resolve()
      }
    })
  })
}

/**
 * Get the Bugsnag error boundary component.
 * Returns a fallback error boundary if Bugsnag is not initialized.
 * 
 * @param React - React instance
 * @returns Error boundary component
 */
export function getBugsnagErrorBoundary(ReactInstance: typeof React): React.ComponentType<any> {
  if (bugsnagReactPlugin) {
    return bugsnagReactPlugin.createErrorBoundary(ReactInstance)
  }

  // Fallback error boundary if Bugsnag fails to load
  return class FallbackErrorBoundary extends ReactInstance.Component<
    { children: React.ReactNode },
    { hasError: boolean }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
      return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      // Log to console in development
      if (import.meta.env.DEV) {
        console.error('Error caught by fallback boundary:', error, errorInfo)
      }
    }

    render() {
      if (this.state.hasError) {
        return ReactInstance.createElement(
          'div',
          {
            style: {
              padding: '20px',
              textAlign: 'center',
              fontFamily: 'system-ui, sans-serif',
            },
          },
          ReactInstance.createElement('h1', null, 'Something went wrong'),
          ReactInstance.createElement(
            'p',
            null,
            'Please refresh the page to continue.'
          ),
          ReactInstance.createElement(
            'button',
            {
              onClick: () => window.location.reload(),
              style: {
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
              },
            },
            'Refresh Page'
          )
        )
      }

      return this.props.children
    }
  }
}

/**
 * Get the Bugsnag instance.
 * 
 * @returns Bugsnag instance or null if not initialized
 */
export function getBugsnagInstance() {
  return bugsnagInstance
}

/**
 * Check if Bugsnag is initialized.
 * 
 * @returns true if Bugsnag is initialized
 */
export function isBugsnagInitialized(): boolean {
  return bugsnagInitialized
}

/**
 * Notify Bugsnag of an error (only if initialized).
 * 
 * @param error - Error to report
 * @param metadata - Additional metadata
 */
export function notifyBugsnag(error: Error, metadata?: Record<string, any>): void {
  if (bugsnagInstance) {
    bugsnagInstance.notify(error, (event: any) => {
      if (metadata) {
        event.addMetadata('custom', metadata)
      }
    })
  } else if (import.meta.env.DEV) {
    console.error('Bugsnag not initialized, error not reported:', error, metadata)
  }
}
