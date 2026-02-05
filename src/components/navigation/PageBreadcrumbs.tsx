import { Breadcrumbs, Link, Typography, useMediaQuery } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import HomeRoundedIcon from "@mui/icons-material/HomeRounded"
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded"

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface PageBreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function PageBreadcrumbs({ items }: PageBreadcrumbsProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <Breadcrumbs
      separator={<NavigateNextRoundedIcon fontSize="small" />}
      maxItems={isMobile ? 2 : undefined}
      sx={{ mb: 2 }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const isFirst = index === 0

        if (isLast) {
          return (
            <Typography
              key={index}
              color="text.primary"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: 500,
              }}
            >
              {item.icon}
              {item.label}
            </Typography>
          )
        }

        return (
          <Link
            key={index}
            component={RouterLink}
            to={item.href!}
            color="secondary"
            underline="hover"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {isFirst && !item.icon && <HomeRoundedIcon fontSize="small" />}
            {item.icon}
            {item.label}
          </Link>
        )
      })}
    </Breadcrumbs>
  )
}
