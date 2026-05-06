import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const storeSlug = headersList.get('x-store-slug')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopflow.app'
  const host = storeSlug ? `https://${storeSlug}.shopflow.app` : appUrl

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${host}/sitemap.xml`,
  }
}
