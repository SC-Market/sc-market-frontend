import React, { useState } from "react"
import {
  Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Typography, CircularProgress,
} from "@mui/material"
import { WarningRounded } from "@mui/icons-material"
import { useExpireAllListingsMutation, useGetActiveListingCountQuery } from "../../store/api/v2/market"
import { useAlertHook } from "../../hooks/alert/AlertHook"

export function ExpireAllListingsButton() {
  const [open, setOpen] = useState(false)
  const { data: countData, refetch } = useGetActiveListingCountQuery(undefined, { skip: !open })
  const [expireAll, { isLoading }] = useExpireAllListingsMutation()
  const issueAlert = useAlertHook()

  const handleConfirm = async () => {
    try {
      const result = await expireAll().unwrap()
      issueAlert({ message: `Expired ${result.affected} listings`, severity: "success" })
      setOpen(false)
    } catch (err: any) {
      issueAlert({ message: err?.data?.message || "Failed to expire listings", severity: "error" })
    }
  }

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        startIcon={<WarningRounded />}
        onClick={() => { setOpen(true); refetch() }}
      >
        Expire All Listings
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Expire All Active Listings?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will set <strong>{countData?.count ?? "..."} active listings</strong> to expired status.
            Sellers will need to manually refresh each listing they want to keep active.
          </DialogContentText>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This is typically done after a game wipe. This action is reversible — sellers can refresh their listings individually.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm} color="error" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={20} /> : `Expire ${countData?.count ?? ""} Listings`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
