import { FlatSection } from "../../components/paper/Section"
import {
  useGetAggregateByIdQuery,
  useGetMarketItemsByCategoryQuery,
} from "../../features/market"
import React, { useMemo, useState } from "react"
import { BuyOrderForm } from "../../features/market"
import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { SelectGameItemStack } from "../../components/select/SelectGameItem"
import { useTranslation } from "react-i18next"

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import CreateRounded from '@mui/icons-material/CreateRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import LocalShippingRounded from '@mui/icons-material/LocalShippingRounded';
import AccountBoxRounded from '@mui/icons-material/AccountBoxRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import Block from '@mui/icons-material/Block';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import HowToRegRounded from '@mui/icons-material/HowToRegRounded';

export function CreateBuyOrder() {
  const { t } = useTranslation()
  const [itemType, setItemType] = useState<string>("Other")
  const [itemName, setItemName] = useState<string | null>(null)

  const { data: items } = useGetMarketItemsByCategoryQuery(itemType!, {
    skip: !itemType,
  })

  const item_name_value = useMemo(
    () =>
      itemName
        ? (items || []).find((o) => o.name === itemName)?.id || null
        : null,
    [items, itemName],
  )

  const { data: aggregate } = useGetAggregateByIdQuery(item_name_value!, {
    skip: !item_name_value,
  })

  return (
    <Page title={t("buyOrderActions.createBuyOrder")}>
      <ContainerGrid sidebarOpen={true}>
        <FlatSection title={t("buyOrderActions.selectMarketItem")}>
          <SelectGameItemStack
            onItemChange={(value) => setItemName(value)}
            onTypeChange={(value) => {
              setItemType(value)
              setItemName(null)
            }}
            item_type={itemType}
            item_name={itemName}
          />
        </FlatSection>

        {item_name_value && aggregate && <BuyOrderForm aggregate={aggregate} />}
      </ContainerGrid>
    </Page>
  )
}
