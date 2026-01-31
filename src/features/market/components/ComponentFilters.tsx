import React from "react"
import {
  Autocomplete,
  Box,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  SelectChangeEvent,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"

interface ComponentFiltersProps {
  filters: {
    component_size?: number[]
    component_grade?: string[]
    component_class?: string[]
    manufacturer?: string[]
    component_type?: string[]
    armor_class?: string[]
    color?: string[]
  }
  onChange: (filters: Partial<ComponentFiltersProps["filters"]>) => void
  availableOptions: {
    sizes: number[]
    grades: string[]
    classes: string[]
    manufacturers: string[]
    types: string[]
    armorClasses: string[]
    colors: string[]
  }
  itemType?: string | null
}

export function ComponentFilters({
  filters,
  onChange,
  availableOptions,
  itemType,
}: ComponentFiltersProps) {
  const { t } = useTranslation()

  // Check if current item type is a weapon to conditionally hide grade filter
  const isWeaponType = itemType?.toLowerCase().includes("weapon")

  const handleSizeChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value
    onChange({
      component_size: typeof value === "string" ? [] : value,
    })
  }

  const handleGradeChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    onChange({
      component_grade: typeof value === "string" ? [] : value,
    })
  }

  const handleClassChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    onChange({
      component_class: typeof value === "string" ? [] : value,
    })
  }

  const handleTypeChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    onChange({
      component_type: typeof value === "string" ? [] : value,
    })
  }

  const handleArmorClassChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    onChange({
      armor_class: typeof value === "string" ? [] : value,
    })
  }

  const handleManufacturerChange = (
    _event: React.SyntheticEvent,
    value: string[],
  ) => {
    onChange({ manufacturer: value })
  }

  const handleColorChange = (_event: React.SyntheticEvent, value: string[]) => {
    onChange({ color: value })
  }

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t("ComponentFilters.title", "Component Attributes")}
          </Typography>
        </Grid>

        {/* Size Class Filter */}
        {availableOptions.sizes.length > 0 && (
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel id="component-size-label">
                {t("ComponentFilters.sizeClass", "Size Class")}
              </InputLabel>
              <Select
                labelId="component-size-label"
                multiple
                value={filters.component_size || []}
                onChange={handleSizeChange}
                label={t("ComponentFilters.sizeClass", "Size Class")}
                color="secondary"
                IconComponent={KeyboardArrowDownRoundedIcon}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={`Size ${value}`}
                        size="small"
                        color="primary"
                      />
                    ))}
                  </Box>
                )}
              >
                {availableOptions.sizes.map((size) => (
                  <MenuItem key={size} value={size}>
                    {t("ComponentFilters.size", "Size {{size}}", { size })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Quality Grade Filter - Only show for non-weapon components */}
        {!isWeaponType && availableOptions.grades.length > 0 && (
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel id="component-grade-label">
                {t("ComponentFilters.qualityGrade", "Quality Grade")}
              </InputLabel>
              <Select
                labelId="component-grade-label"
                multiple
                value={filters.component_grade || []}
                onChange={handleGradeChange}
                label={t("ComponentFilters.qualityGrade", "Quality Grade")}
                color="secondary"
                IconComponent={KeyboardArrowDownRoundedIcon}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={`Grade ${value}`}
                        size="small"
                        color="secondary"
                      />
                    ))}
                  </Box>
                )}
              >
                {availableOptions.grades.map((grade) => (
                  <MenuItem key={grade} value={grade}>
                    {t("ComponentFilters.grade", "Grade {{grade}}", { grade })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Component Class Filter */}
        {availableOptions.classes.length > 0 && (
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel id="component-class-label">
                {t("ComponentFilters.componentClass", "Component Class")}
              </InputLabel>
              <Select
                labelId="component-class-label"
                multiple
                value={filters.component_class || []}
                onChange={handleClassChange}
                label={t("ComponentFilters.componentClass", "Component Class")}
                color="secondary"
                IconComponent={KeyboardArrowDownRoundedIcon}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              >
                {availableOptions.classes.map((cls) => (
                  <MenuItem key={cls} value={cls}>
                    {cls}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Component Type Filter */}
        {availableOptions.types.length > 0 && (
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel id="component-type-label">
                {t("ComponentFilters.componentType", "Component Type")}
              </InputLabel>
              <Select
                labelId="component-type-label"
                multiple
                value={filters.component_type || []}
                onChange={handleTypeChange}
                label={t("ComponentFilters.componentType", "Component Type")}
                color="secondary"
                IconComponent={KeyboardArrowDownRoundedIcon}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {availableOptions.types.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Armor Class Filter */}
        {availableOptions.armorClasses.length > 0 && (
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel id="armor-class-label">
                {t("ComponentFilters.armorClass", "Armor Class")}
              </InputLabel>
              <Select
                labelId="armor-class-label"
                multiple
                value={filters.armor_class || []}
                onChange={handleArmorClassChange}
                label={t("ComponentFilters.armorClass", "Armor Class")}
                color="secondary"
                IconComponent={KeyboardArrowDownRoundedIcon}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                        color="info"
                      />
                    ))}
                  </Box>
                )}
              >
                {availableOptions.armorClasses.map((cls) => (
                  <MenuItem key={cls} value={cls}>
                    {cls}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Manufacturer Filter */}
        {availableOptions.manufacturers.length > 0 && (
          <Grid item xs={12}>
            <Autocomplete
              multiple
              size="small"
              options={availableOptions.manufacturers}
              value={filters.manufacturer || []}
              onChange={handleManufacturerChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("ComponentFilters.manufacturer", "Manufacturer")}
                  color="secondary"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                  />
                ))
              }
            />
          </Grid>
        )}

        {/* Color Filter */}
        {availableOptions.colors.length > 0 && (
          <Grid item xs={12}>
            <Autocomplete
              multiple
              size="small"
              options={availableOptions.colors}
              value={filters.color || []}
              onChange={handleColorChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("ComponentFilters.color", "Color")}
                  color="secondary"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                  />
                ))
              }
            />
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
