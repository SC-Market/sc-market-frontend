import React from "react"
import { Helmet } from "react-helmet"
import { Contractor } from "../../../datatypes/Contractor"
import { FRONTEND_URL } from "../../../util/constants"

import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Breakpoint from '@mui/material/Breakpoint';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';

interface OrgMetaTagsProps {
  contractor: Contractor
}

export function OrgMetaTags({ contractor }: OrgMetaTagsProps) {
  return (
    <Helmet>
      <meta property="og:type" content="website" />
      <meta
        property="og:url"
        content={`${FRONTEND_URL}/contractor/${contractor.spectrum_id}`}
      />
      <meta property="og:title" content={`${contractor.name} - SC Market`} />
      <meta
        property="og:description"
        content={contractor.description || `${contractor.name} on SC Market`}
      />
      <meta
        property="og:image"
        content={contractor.banner || contractor.avatar}
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:url"
        content={`${FRONTEND_URL}/contractor/${contractor.spectrum_id}`}
      />
      <meta name="twitter:title" content={`${contractor.name} - SC Market`} />
      <meta
        name="twitter:description"
        content={contractor.description || `${contractor.name} on SC Market`}
      />
      <meta
        name="twitter:image"
        content={contractor.banner || contractor.avatar}
      />
    </Helmet>
  )
}
