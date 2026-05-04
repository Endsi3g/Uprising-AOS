'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Percent, TrendingUp } from 'lucide-react'

interface CompensationCardProps {
  revenueShare: number
  totalMonthlyRevenue: number
  estimatedCompensation: number
}

export function CompensationCard({ 
  revenueShare, 
  totalMonthlyRevenue, 
  estimatedCompensation 
}: CompensationCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-500" />
          Compensation Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Revenue Share</p>
            <div className="flex items-center gap-1">
              <Percent className="h-3 w-3 text-muted-foreground" />
              <span className="text-lg font-bold">{revenueShare}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Revenu Agence (Mois)</p>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold">{totalMonthlyRevenue.toLocaleString()}$</span>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground font-medium">Part estimée</p>
            <div className="flex items-center gap-1 text-green-500">
              <TrendingUp className="h-3 w-3" />
              <span className="text-[10px] font-bold">LIVE</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-green-500">
            {estimatedCompensation.toLocaleString()}$
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 italic">
            * Calculé sur les revenus encaissés ce mois-ci.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
