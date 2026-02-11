/**
 * YouTube embed facade component that loads the actual player only on user interaction.
 * 
 * This component displays a lightweight preview image with a play button overlay.
 * The actual YouTube player is only loaded when the user clicks to play,
 * significantly reducing initial page load time and bandwidth usage.
 * 
 * Requirements: 7.3 - Implement facade pattern for heavy embeds
 */

import React, { useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GridProps } from '@mui/material/Grid';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import ReportIcon from '@mui/icons-material/Report';
import KeyboardArrowLeftRounded from '@mui/icons-material/KeyboardArrowLeftRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Map from '@mui/icons-material/Map';
import VideoLibrary from '@mui/icons-material/VideoLibrary';

interface YouTubeFacadeProps {
  /**
   * YouTube video ID (e.g., "dQw4w9WgXcQ")
   */
  videoId: string
  
  /**
   * Optional title for accessibility
   */
  title?: string
  
  /**
   * Optional width (default: 100%)
   */
  width?: string | number
  
  /**
   * Optional height (default: auto with 16:9 aspect ratio)
   */
  height?: string | number
}

const FacadeContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  paddingBottom: '56.25%', // 16:9 aspect ratio
  backgroundColor: '#000',
  cursor: 'pointer',
  overflow: 'hidden',
  '&:hover .play-button': {
    transform: 'scale(1.1)',
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
  },
}))

const ThumbnailImage = styled('img')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
})

const PlayButtonOverlay = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1,
})

const PlayButton = styled(IconButton)(({ theme }) => ({
  width: 68,
  height: 48,
  backgroundColor: 'rgba(255, 0, 0, 0.8)',
  borderRadius: '12px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: 48,
    color: '#fff',
  },
}))

const IframeContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
})

/**
 * YouTube embed facade component.
 * 
 * Displays a lightweight thumbnail with play button. Only loads the actual
 * YouTube iframe when the user clicks to play.
 * 
 * @example
 * <YouTubeFacade videoId="dQw4w9WgXcQ" title="Never Gonna Give You Up" />
 */
export function YouTubeFacade({ videoId, title, width, height }: YouTubeFacadeProps) {
  const [isActivated, setIsActivated] = useState(false)

  const handleActivate = () => {
    setIsActivated(true)
  }

  // YouTube thumbnail URL (maxresdefault for highest quality, fallback to hqdefault)
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`

  if (isActivated) {
    // Load actual YouTube iframe
    return (
      <FacadeContainer sx={{ width, height: height || undefined }}>
        <IframeContainer>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title || 'YouTube video player'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </IframeContainer>
      </FacadeContainer>
    )
  }

  // Show facade with thumbnail and play button
  return (
    <FacadeContainer
      sx={{ width, height: height || undefined }}
      onClick={handleActivate}
      role="button"
      aria-label={`Play video: ${title || videoId}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleActivate()
        }
      }}
    >
      <ThumbnailImage
        src={thumbnailUrl}
        alt={title || 'YouTube video thumbnail'}
        loading="lazy"
        onError={(e) => {
          // Fallback to hqdefault if maxresdefault fails
          const target = e.target as HTMLImageElement
          if (target.src.includes('maxresdefault')) {
            target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          }
        }}
      />
      <PlayButtonOverlay>
        <PlayButton className="play-button" aria-label="Play video">
          <PlayArrow />
        </PlayButton>
      </PlayButtonOverlay>
    </FacadeContainer>
  )
}
