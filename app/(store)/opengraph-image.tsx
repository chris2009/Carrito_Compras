import { ImageResponse } from 'next/og'
import { headers } from 'next/headers'
import { getCurrentStore } from '@/lib/supabase/store-context'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function StoreOGImage() {
  const headersList = await headers()
  const slug = headersList.get('x-store-slug') || ''
  const store = slug ? await getCurrentStore(slug) : null

  const name = store?.name || 'ShopFlow'
  const description = store?.description || 'Tu tienda online'
  const primary = (store?.theme as { primary?: string })?.primary || '#6366f1'
  const secondary = (store?.theme as { secondary?: string })?.secondary || '#06b6d4'

  return new ImageResponse(
    <div
      style={{
        background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        padding: '80px',
      }}
    >
      {store?.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={store.logo_url}
          alt={name}
          width={120}
          height={120}
          style={{ borderRadius: '24px', marginBottom: '32px', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: '100px',
            height: '100px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '56px',
            color: 'white',
            marginBottom: '32px',
          }}
        >
          🛍
        </div>
      )}
      <div style={{ fontSize: '72px', fontWeight: 'bold', color: 'white', textAlign: 'center', lineHeight: 1.1, marginBottom: '24px' }}>
        {name}
      </div>
      {description && (
        <div style={{ fontSize: '32px', color: 'rgba(255,255,255,0.8)', textAlign: 'center', maxWidth: '800px' }}>
          {description.slice(0, 120)}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '60px',
          fontSize: '20px',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        Powered by ShopFlow
      </div>
    </div>,
    size,
  )
}
