import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  Grid,
  IconButton,
  InputAdornment,
  Link as MaterialLink,
  Paper,
  Stack,
  TableCell,
  tableCellClasses,
  TableRow,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { HapticButton } from "../../../components/haptic";
import { ExtendedTheme } from "../../../hooks/styles/Theme";
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg";
import { useGetUserProfileQuery } from "../../../store/profile";
import {
  AddShoppingCartRounded,
  EditRounded,
  VisibilityRounded,
  ZoomInRounded,
} from "@mui/icons-material";
import { useAlertHook } from "../../../hooks/alert/AlertHook";
import { MarkdownRender } from "../../../components/markdown/Markdown.lazy";
import { useCookies } from "react-cookie";
import { FRONTEND_URL } from "../../../util/constants";
import { Cart } from "../../../datatypes/Cart";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ListingNameAndRating } from "../../../components/rating/ListingRating";
