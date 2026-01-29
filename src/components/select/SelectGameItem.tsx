import {
  Autocomplete,
  Grid,
  TextField,
  TextFieldProps,
} from "@mui/material"
import React, { useMemo } from "react"
import {
  useGetMarketCategoriesQuery,
  useGetMarketItemsByCategoryQuery,
} from "../../store/market"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export interface SelectGameItemProps {
  item_type: string
  item_name: string | null
  onTypeChange: (newValue: string) => void
  onItemChange: (newValue: string | null) => void
  TextfieldProps?: TextFieldProps
  size?: "small" | "medium" | undefined
}

export function SelectGameItemStack(props: SelectGameItemProps) {
  const { t } = useTranslation()
  const { data: categories } = useGetMarketCategoriesQuery()
  const { data: items, isLoading: itemsLoading } =
    useGetMarketItemsByCategoryQuery(props.item_type!, {
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
          size={props.size || "medium"}
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
              aria-describedby="item-type-help"
              inputProps={{
                ...params.inputProps,
                "aria-label": t(
                  "accessibility.selectItemType",
                  "Select item type",
                ),
              }}
            />
          )}
          getOptionLabel={(option) => option.subcategory}
          aria-label={t("accessibility.itemTypeSelector", "Item type selector")}
        />
        <div id="item-type-help" className="sr-only">
          {t(
            "accessibility.itemTypeHelp",
            "Select the category of item you want to list",
          )}
        </div>
      </Grid>
      <Grid item xs={12} lg={12}>
        <Autocomplete
          // fullWidth
          options={props.item_type ? items || [] : []}
          id="item-name"
          size={props.size || "medium"}
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
              aria-describedby="item-name-help"
              inputProps={{
                ...params.inputProps,
                "aria-label": t(
                  "accessibility.selectItemName",
                  "Select item name",
                ),
              }}
            />
          )}
          getOptionLabel={(option) => option.name}
          disabled={!props.item_type || !items || items.length === 0}
          loading={itemsLoading}
          aria-label={t("accessibility.itemNameSelector", "Item name selector")}
          aria-describedby={
            !props.item_type ? "item-name-disabled-help" : "item-name-help"
          }
        />
        <div id="item-name-help" className="sr-only">
          {t(
            "accessibility.itemNameHelp",
            "Select the specific item you want to list",
          )}
        </div>
        {!props.item_type && (
          <div id="item-name-disabled-help" className="sr-only">
            {t(
              "accessibility.itemNameDisabledHelp",
              "Please select an item type first",
            )}
          </div>
        )}
      </Grid>
    </>
  )
}

export function SelectGameItem(props: SelectGameItemProps) {
  const { t } = useTranslation()
  const { data: categories } = useGetMarketCategoriesQuery()
  const { data: items, isLoading: itemsLoading } =
    useGetMarketItemsByCategoryQuery(props.item_type!, {
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
            aria-describedby="item-type-help"
            inputProps={{
              ...params.inputProps,
              "aria-label": t(
                "accessibility.selectItemType",
                "Select item type",
              ),
            }}
          />
        )}
        getOptionLabel={(option) => option.subcategory}
        aria-label={t("accessibility.itemTypeSelector", "Item type selector")}
        aria-describedby="item-type-help"
      />
      <div id="item-type-help" className="sr-only">
        {t(
          "accessibility.itemTypeHelp",
          "Select the category of item you want to list",
        )}
      </div>
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
            aria-describedby={
              !props.item_type ? "item-name-disabled-help" : "item-name-help"
            }
            inputProps={{
              ...params.inputProps,
              "aria-label": t(
                "accessibility.selectItemName",
                "Select item name",
              ),
            }}
          />
        )}
        getOptionLabel={(option) => option.name}
        disabled={!props.item_type || !items || items.length === 0}
        loading={itemsLoading}
        aria-label={t("accessibility.itemNameSelector", "Item name selector")}
        aria-describedby={
          !props.item_type ? "item-name-disabled-help" : "item-name-help"
        }
      />
      <div id="item-name-help" className="sr-only">
        {t(
          "accessibility.itemNameHelp",
          "Select the specific item you want to list",
        )}
      </div>
      {!props.item_type && (
        <div id="item-name-disabled-help" className="sr-only">
          {t(
            "accessibility.itemNameDisabledHelp",
            "Please select an item type first",
          )}
        </div>
      )}
    </>
  )
}

export function SelectGameCategory(props: {
  item_type: string
  onTypeChange: (newValue: string) => void
  TextfieldProps?: TextFieldProps
}) {
  const { t } = useTranslation()
  const { data: categories } = useGetMarketCategoriesQuery()

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
  const { data: categories } = useGetMarketCategoriesQuery()

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
