import { Autocomplete, Grid, TextField, TextFieldProps } from "@mui/material"
import React, { useMemo } from "react"
import {
  useMarketCategoriesQuery,
  useMarketItemsByCategoryQuery,
} from "../../store/market"
import { useTranslation } from "react-i18next" // add i18n

export interface SelectGameItemProps {
  item_type: string
  item_name: string | null
  onTypeChange: (newValue: string) => void
  onItemChange: (newValue: string | null) => void
  TextfieldProps?: TextFieldProps
}

export function SelectGameItemStack(props: SelectGameItemProps) {
  const { t } = useTranslation() // add i18n
  const { data: categories } = useMarketCategoriesQuery()
  const { data: items, isLoading: itemsLoading } =
    useMarketItemsByCategoryQuery(props.item_type!, {
      skip: !props.item_type,
    })

  const category_value = useMemo(
    () =>
      categories
        ? (categories || []).find((o) => o.subcategory === props.item_type) || {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          }
        : {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          },
    [categories, props.item_type, t],
  )
  const item_name_value = useMemo(
    () =>
      props.item_name
        ? (items || []).find((o) => o.name === props.item_name) || null
        : null,
    [items, props.item_name],
  )

  return (
    <>
      <Grid item xs={12} lg={12}>
        <Autocomplete
          // fullWidth
          options={categories || []}
          id="item-type"
          value={category_value}
          onChange={(event, value) => {
            if (value) {
              props.onTypeChange(value.subcategory)
            }
          }}
          groupBy={(o) => o.category}
          color={"secondary"}
          renderInput={(params) => (
            <TextField {...params} label={t("market.item_type", "Item Type")} />
          )}
          getOptionLabel={(option) => option.subcategory}
        />
      </Grid>
      <Grid item xs={12} lg={12}>
        <Autocomplete
          // fullWidth
          options={props.item_type ? items || [] : []}
          id="item-name"
          value={item_name_value}
          onChange={(event, value) => {
            props.onItemChange(value ? value.name : null)
          }}
          color={"secondary"}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("market.item_name", "Item Name")}
              {...props.TextfieldProps}
            />
          )}
          getOptionLabel={(option) => option.name}
          disabled={!props.item_type || !items || items.length === 0}
          loading={itemsLoading}
        />
      </Grid>
    </>
  )
}

export function SelectGameItem(props: SelectGameItemProps) {
  const { t } = useTranslation()
  const { data: categories } = useMarketCategoriesQuery()
  const { data: items, isLoading: itemsLoading } =
    useMarketItemsByCategoryQuery(props.item_type!, {
      skip: !props.item_type,
    })

  const category_value = useMemo(
    () =>
      categories
        ? (categories || []).find((o) => o.subcategory === props.item_type) || {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          }
        : {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          },
    [categories, props.item_type, t],
  )
  const item_name_value = useMemo(
    () =>
      props.item_name
        ? (items || []).find((o) => o.name === props.item_name) || null
        : null,
    [items, props.item_name],
  )

  return (
    <>
      <Autocomplete
        // fullWidth
        options={categories || []}
        id="item-type"
        value={category_value}
        onChange={(event, value) => {
          if (value) {
            props.onTypeChange(value.subcategory)
          }
        }}
        groupBy={(o) => o.category}
        color={"secondary"}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("market.item_type", "Item Type")}
            {...props.TextfieldProps}
          />
        )}
        getOptionLabel={(option) => option.subcategory}
      />
      <Autocomplete
        // fullWidth
        options={props.item_type ? items || [] : []}
        id="item-name"
        value={item_name_value}
        onChange={(event, value) => {
          props.onItemChange(value ? value.name : null)
        }}
        color={"secondary"}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("market.item_name", "Item Name")}
            {...props.TextfieldProps}
          />
        )}
        getOptionLabel={(option) => option.name}
        disabled={!props.item_type || !items || items.length === 0}
        loading={itemsLoading}
      />
    </>
  )
}

export function SelectGameCategory(props: {
  item_type: string
  onTypeChange: (newValue: string) => void
  TextfieldProps?: TextFieldProps
}) {
  const { t } = useTranslation()
  const { data: categories } = useMarketCategoriesQuery()

  const category_value = useMemo(
    () =>
      categories
        ? (categories || []).find((o) => o.subcategory === props.item_type) || {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          }
        : {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          },
    [categories, props.item_type, t],
  )

  return (
    <>
      <Grid item xs={12} lg={12}>
        <Autocomplete
          // fullWidth
          options={categories || []}
          id="item-type"
          value={category_value}
          onChange={(event, value) => {
            if (value) {
              props.onTypeChange(value.subcategory)
            }
          }}
          groupBy={(o) => o.category}
          color={"secondary"}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("market.item_type", "Item Type")}
              {...props.TextfieldProps}
            />
          )}
          getOptionLabel={(option) => option.subcategory}
        />
      </Grid>
    </>
  )
}

export function SelectGameCategoryOption(props: {
  item_type: string | null
  onTypeChange: (newValue: string | null) => void
  TextfieldProps?: TextFieldProps
}) {
  const { t } = useTranslation()
  const { data: categories } = useMarketCategoriesQuery()

  const category_value = useMemo(
    () =>
      categories
        ? (categories || []).find((o) => o.subcategory === props.item_type) || {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          }
        : {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          },
    [categories, props.item_type, t],
  )

  return (
    <>
      <Grid item xs={12} lg={12}>
        <Autocomplete
          // fullWidth
          options={categories || []}
          id="item-type"
          value={category_value}
          onChange={(event, value) => {
            props.onTypeChange(value ? value.subcategory : null)
          }}
          groupBy={(o) => o.category}
          color={"secondary"}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("market.item_type", "Item Type")}
              {...props.TextfieldProps}
            />
          )}
          getOptionLabel={(option) => option.subcategory}
        />
      </Grid>
    </>
  )
}
