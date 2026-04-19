import React, { useState, useEffect } from "react"
import {
  Autocomplete,
  TextField,
  Avatar,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { User } from "../../datatypes/User"
import { useSearchUsersQuery } from "../../store/profile"

interface UserSearchProps {
  onUserSelect: (user: User) => void
  placeholder?: string
  disabled?: boolean
}

interface SearchResult {
  username: string
  display_name: string
  avatar: string
  user_id: string
}

export function UserSearch({
  onUserSelect,
  placeholder,
  disabled,
}: UserSearchProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [open, setOpen] = useState(false)

  // Debounce
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(id)
  }, [query])

  const { data: options = [], isFetching: loading } = useSearchUsersQuery(
    debouncedQuery,
    { skip: debouncedQuery.length < 2 },
  )

  const handleUserSelect = (user: SearchResult | null) => {
    if (user) {
      const userObj: User & { user_id?: string } = {
        ...user,
        user_id: user.user_id,
        orders: 0,
        spent: 0,
        banner: "",
        contractors: [],
        profile_description: "",
        rating: {
          avg_rating: 0,
          rating_count: 0,
          streak: 0,
          total_orders: 0,
          total_rating: 0,
          total_assignments: 0,
          response_rate: 0,
        },
        market_order_template: "",
        created_at: Date.now(),
        rsi_confirmed: false,
      }
      onUserSelect(userObj as User)
      setQuery("")
      setOpen(false)
    }
  }

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options as unknown as SearchResult[]}
      loading={loading}
      disabled={disabled}
      getOptionLabel={(option) => option.display_name || option.username}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Avatar src={option.avatar} sx={{ width: 32, height: 32, mr: 2 }} />
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {option.display_name || option.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{option.username}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder || t("userSearch.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      onChange={(_, value) => handleUserSelect(value)}
      noOptionsText={
        query.length < 2
          ? t("userSearch.typeToSearch")
          : t("userSearch.noResults")
      }
    />
  )
}
