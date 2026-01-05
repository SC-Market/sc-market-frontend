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
import { BACKEND_URL } from "../../util/constants"
import { User } from "../../datatypes/User"

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
  const [options, setOptions] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const searchUsers = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setOptions([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/profile/search/${encodeURIComponent(searchQuery)}`,
        {
          method: "GET",
          credentials: "include",
        },
      )
      const data = await response.json()
      setOptions(data || [])
    } catch (error) {
      console.error("Error searching users:", error)
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchUsers(query)
      } else {
        setOptions([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleUserSelect = (user: SearchResult | null) => {
    if (user) {
      // Convert SearchResult to User format
      // Explicitly preserve user_id even though it's not in User type
      const userObj: User & { user_id?: string } = {
        ...user,
        user_id: user.user_id, // Explicitly preserve user_id
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
      setOptions([])
      setOpen(false)
    }
  }

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
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
