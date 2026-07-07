import {
  Breadcrumbs,
  BreadcrumbsProps,
  Link,
  Typography,
  TypographyProps,
  useMediaQuery,
} from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import HomeRoundedIcon from "@mui/icons-material/HomeRounded"
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded"
import { Helmet } from "react-helmet"
import { FRONTEND_URL } from "../../util/constants"

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface PageBreadcrumbsProps {
  items: BreadcrumbItem[]
  MuiBreadcrumbsProps?: BreadcrumbsProps
}

export function PageBreadcrumbs({
  items,
  MuiBreadcrumbsProps,
}: PageBreadcrumbsProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  if (items.length <= 1) return null

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${FRONTEND_URL}${item.href}` } : {}),
    })),
  }

  return (
    <>
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
    <Breadcrumbs
      {...MuiBreadcrumbsProps}
      separator={<NavigateNextRoundedIcon fontSize="small" />}
      maxItems={isMobile ? 2 : undefined}
      sx={{ mb: 2, ...MuiBreadcrumbsProps?.sx }}
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
    </>
  )
}
