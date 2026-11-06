import { Breadcrumbs, BreadcrumbsProps, Link, Typography } from "@mui/material"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import { Link as RouterLink } from "react-router-dom"
import HomeRoundedIcon from "@mui/icons-material/HomeRounded"
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded"
import { Helmet } from "@unhead/react/helmet"
import { FRONTEND_URL } from "../../util/constants"
import { BREADCRUMB_JSONLD_KEY, serializeJsonLd } from "../../seo/pageHead"

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface PageBreadcrumbsProps {
  items: BreadcrumbItem[]
  MuiBreadcrumbsProps?: BreadcrumbsProps
}

/**
 * The trail as BreadcrumbList JSON-LD, at low priority under the shared
 * key: a page whose own head has a BreadcrumbList (SeoHead, the bridge and
 * server renders) keeps that one, so there is only ever one per page.
 */
function BreadcrumbJsonLd({ schema }: { schema: object }) {
  return (
    <Helmet
      script={[
        {
          key: BREADCRUMB_JSONLD_KEY,
          tagPriority: "low",
          tagDuplicateStrategy: "replace",
          type: "application/ld+json",
          innerHTML: serializeJsonLd(schema),
        },
      ]}
    />
  )
}

export function PageBreadcrumbs({
  items,
  MuiBreadcrumbsProps,
}: PageBreadcrumbsProps) {
  const isMobile = useBreakpointDown("sm")

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
      <BreadcrumbJsonLd schema={breadcrumbSchema} />
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
