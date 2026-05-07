import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'ShopFlow — Tu tienda online en minutos'

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        padding: '60px',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '20px',
          padding: '16px 32px',
          marginBottom: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            background: 'white',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#6366f1',
          }}
        >
          S
        </div>
        <span style={{ fontSize: '48px', fontWeight: 'bold', color: 'white' }}>ShopFlow</span>
      </div>
      <div style={{ fontSize: '60px', fontWeight: 'bold', color: 'white', textAlign: 'center', lineHeight: 1.2 }}>
        Tu tienda online
      </div>
      <div style={{ fontSize: '60px', fontWeight: 'bold', color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: '40px' }}>
        en minutos
      </div>
      <div
        style={{
          fontSize: '28px',
          color: 'rgba(255,255,255,0.75)',
          textAlign: 'center',
          maxWidth: '700px',
        }}
      >
        Crea tu tienda gratis · Stripe Checkout · Multi-tenant
      </div>
    </div>,
    size,
  )
}
