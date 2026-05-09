'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type StoreChartItem = {
  name: string
  products: number
  orders: number
  plan: string
}

const PLAN_COLORS: Record<string, string> = {
  free: '#6b7280',
  pro: '#6366f1',
  enterprise: '#a855f7',
}

const BAR_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe']

export function StoreCharts({ stores }: { stores: StoreChartItem[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { resolvedTheme } = useTheme()
  const isDark = mounted && resolvedTheme === 'dark'

  const textColor = isDark ? '#9ca3af' : '#6b7280'
  const gridColor = isDark ? '#374151' : '#e5e7eb'
  const tooltipStyle: React.CSSProperties = {
    background: isDark ? '#1f2937' : '#ffffff',
    border: `1px solid ${gridColor}`,
    borderRadius: '8px',
    color: isDark ? '#f3f4f6' : '#111827',
    fontSize: '12px',
  }

  const planCounts = stores.reduce<Record<string, number>>((acc, s) => {
    acc[s.plan] = (acc[s.plan] || 0) + 1
    return acc
  }, {})

  const planData = Object.entries(planCounts).map(([plan, count]) => ({
    name: plan.charAt(0).toUpperCase() + plan.slice(1),
    value: count,
    color: PLAN_COLORS[plan] ?? '#6b7280',
  }))

  const chartStores = stores.map((s) => ({
    ...s,
    name: s.name.length > 14 ? s.name.slice(0, 14) + '…' : s.name,
  }))

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Products per store */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Productos por tienda</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartStores} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: textColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: textColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: isDark ? '#1f2937' : '#f3f4f6' }}
                formatter={(v) => [v, 'Productos']}
              />
              <Bar dataKey="products" name="Productos" radius={[6, 6, 0, 0]} maxBarSize={64}>
                {chartStores.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Plan distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Distribución de planes</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          {planData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {planData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v, name) => [v, name]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span style={{ color: textColor, fontSize: 12 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Sin datos de planes</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
