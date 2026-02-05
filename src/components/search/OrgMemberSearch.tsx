import React, { useState, useEffect, useCallback } from "react"
import {
  Autocomplete,
  TextField,
  Avatar,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { contractorsApi } from "../../store/contractor"
import { store } from "../../store/store"
import throttle from "lodash/throttle"

interface OrgMember {
  username: string
  display_name: string
  avatar?: string
}

interface OrgMemberSearchProps {
  onMemberSelect: (member: OrgMember | null) => void
  placeholder?: string
  disabled?: boolean
  label?: string
  fullWidth?: boolean
  size?: "small" | "medium"
  includeSelf?: boolean
}

export function OrgMemberSearch({
  onMemberSelect,
  placeholder,
  disabled,
  label,
  fullWidth = false,
  size = "medium",
  includeSelf = true,
}: OrgMemberSearchProps) {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()
  const [query, setQuery] = useState("")
  const [options, setOptions] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null)

  const searchMembers = useCallback(
    async (searchQuery: string) => {
      if (!currentOrg?.spectrum_id) {
        setOptions([])
        return
      }

      // Show options even with empty search
      setLoading(true)
      try {
        const { data } = await store.dispatch(
          contractorsApi.endpoints.searchContractorMembers.initiate({
            spectrum_id: currentOrg.spectrum_id,
            query: searchQuery || "",
          }),
        )
        setOptions(data || [])
      } catch (error) {
        console.error("Error searching org members:", error)
        setOptions([])
      } finally {
        setLoading(false)
      }
    },
    [currentOrg?.spectrum_id],
  )

  const throttledSearch = React.useMemo(
    () => throttle((q: string) => searchMembers(q), 300),
    [searchMembers],
  )

  useEffect(() => {
    throttledSearch(query)
  }, [query, throttledSearch])

  const handleMemberSelect = (member: OrgMember | null) => {
    setSelectedMember(member)
    onMemberSelect(member)
  }

  return (
    <Autocomplete
      fullWidth={fullWidth}
      size={size}
      value={selectedMember}
      onChange={(_, newValue) => handleMemberSelect(newValue)}
      inputValue={query}
      onInputChange={(_, newInputValue) => setQuery(newInputValue)}
      options={options}
      getOptionLabel={(option) => option.display_name || option.username}
      loading={loading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || t("OrgMemberSearch.label", "Org Member")}
          placeholder={
            placeholder || t("OrgMemberSearch.placeholder", "Search members...")
          }
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Avatar src={option.avatar} sx={{ width: 32, height: 32, mr: 1 }}>
            {option.display_name?.[0] || option.username[0]}
          </Avatar>
          <Box>
            <Typography variant="body2">{option.display_name}</Typography>
            <Typography variant="caption" color="text.secondary">
              @{option.username}
            </Typography>
          </Box>
        </Box>
      )}
    />
  )
}
